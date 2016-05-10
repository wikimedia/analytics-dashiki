'use strict';
// NOTE: a few oddities remain from when this was hardcoded to
// compare only visual editor and wikitext, but it's much cleaner
define(function (require) {

    var ko = require('knockout'),
        _ = require('lodash'),
        templateMarkup = require('text!./compare-layout.html'),
        apiFinder = require('api-finder'),
        configApi = require('apis.config'),
        marked = require('marked'),
        moment = require('moment'),
        dateUtils = require('utils.datetime'),
        colorUtils = require('utils.colors'),
        numberUtils = require('utils.numbers'),
        asyncObs = require('observables.async'),
        TimeseriesData = require('converters.timeseries');

    require('twix');

    function FunnelLayout() {
        // *** set up the filters with empty options, fill later from config
        this.wiki = {
            options: ko.observable([]),
            selected: ko.observable(),
        };
        var wikimetricsApi = apiFinder({api: 'wikimetrics'}),
            wikiPromise = wikimetricsApi.getProjectAndLanguageChoices(function (data) {
                var databases = Object.getOwnPropertyNames(data.reverseLookup).sort();
                this.wiki.options(['all'].concat(databases));
            }.bind(this));

        // dates filled from configuration
        this.dates = ko.observable([]);
        this.fromDate = {
            options: this.dates,
            selected: ko.observable(),
            format: dateUtils.formatDate,
        };
        this.toDate = {
            options: ko.computed(function() {
                return this.dates().filter(function (d) {
                    return d >= (this.fromDate.selected() || '');
                }, this);
            }, this),
            selected: ko.observable(),
            format: dateUtils.formatDate,
            defaultToLast: true,
        };
        this.fromDate.selected.subscribe(function (newFromDate) {
            if (newFromDate > this.toDate.selected()) {
                this.toDate.selected(newFromDate);
            }
        }, this);
        this.timespan = ko.computed(function() {
            return dateUtils.timespan(this.fromDate.selected(), this.toDate.selected());
            // rate limit for when fromDate forces a change on toDate
        }, this).extend({ rateLimit: 0 });

        this.comparable = {
            options: ko.observable([]),
            selected: ko.observable(),
        };

        // automatically select the first option if the options change
        // if the params dictate, select the last option instead
        [this.wiki, this.fromDate, this.toDate, this.comparable].forEach(function(single){
            single.options.subscribe(function(changedOptions){
                if (!changedOptions || !changedOptions.length) {
                    return;
                }
                single.selected(changedOptions[
                    this.defaultToLast ? changedOptions.length - 1 : 0
                ]);
            }, single);
        });

        // Observing whether a or b are supposed to show separately would
        // cause thrashing, so we make a single computed that changes both
        // together
        this.showAB = ko.computed(function () {
            var selected = this.comparable.selected();
            if (this.config) {
                return {
                    a: selected !== this.config.b,
                    b: selected !== this.config.a,
                };
            } else {
                return {a: false, b: false};
            }
        }, this);

        this.comparisons = ko.observable([]);

        // *** Get this dashboard's configuration and load it up
        // (wait for wikis to be done loading otherwise we thrash)
        wikiPromise.done(function (){
            configApi.getDefaultDashboard(function (config) {

                this.config = config;

                // dates
                var days = moment
                    .twix(moment.utc(config.startDate).toDate(), new Date())
                    .iterate('days');
                var dates = [];
                while (days.hasNext()) {
                    dates.push(days.next());
                }
                this.dates(dates);

                // comparables (whatever you're A/B comparing)
                this.comparable.options([config.a, 'Both', config.b]);

                // comparisons
                var asyncData = asyncObs.asyncData.bind(this),
                    api = apiFinder({api: 'datasets'}),
                    emptyPromise = new $.Deferred();

                emptyPromise.resolveWith(null, [new TimeseriesData([])]);

                this.comparisons(config.comparisons.map(function (c) {

                    // a container for the async output of the following logic
                    c.data = ko.observable();

                    // promise what is being selected from the api
                    var apiPromises = ko.computed(function () {
                        var wiki = ko.unwrap(this.wiki.selected),
                            showAB = ko.unwrap(this.showAB);

                        return ['a', 'b'].map(function (side) {
                            var metricInfo = {
                                'metric': c.metric,
                                'submetric': config[side]
                            };
                            return {
                                promise: showAB[side] ?
                                      api.getData(metricInfo, wiki)
                                    : emptyPromise,
                                label: config[side]
                            };
                        });

                    }, this);

                    // filter and process the result of the promises
                    // and put the output in c.data
                    ko.computed(function () {
                        var from = ko.unwrap(this.fromDate.selected),
                            to = ko.unwrap(this.toDate.selected),
                            promises = _.pluck(apiPromises(), 'promise'),
                            // don't filter when showAB changes, let
                            // the promises deal with that dependency
                            showAB = this.showAB();

                        $.when.apply(this, promises).then(function (data1, data2) {
                            data1.filter(from, to);
                            data2.filter(from, to);

                            if (c.type === 'timeseries') {
                                c.data(data1.merge(data2));
                            }
                            else if (c.type === 'sunburst' || c.type === 'stacked-bars') {
                                c.data({
                                    showAB: showAB,
                                    a: {
                                        label: config.a,
                                        data: data1,
                                    },
                                    b: {
                                        label: config.b,
                                        data: data2,
                                    }
                                });
                            }
                        });
                    }, this).extend({rateLimit: 0});

                    c.desc = c.desc ? marked(c.desc, {sanitize: true}) : '';

                    if (c.annotationsMetric) {
                        var annotationInfo = {
                            'metric': c.annotationsMetric,
                            'submetric': config.a
                        };
                        // use 'all' as the constant wiki, annotations don't vary by wiki
                        c.annotations = asyncData(api, annotationInfo, 'all');
                    }

                    // default to a 10-color scale, but use config if present
                    var colorScale = colorUtils.category10();
                    if (c.colors) {
                        var domain = [], range = [];
                        _.forEach(c.colors, function (val, key) {
                            range.push(val);
                            domain.push(key);
                        });
                        colorScale = colorUtils.category10(domain, range);
                    }
                    c.colors = colorScale;

                    c.format = numberUtils.numberFormatter(c.format || 'percent');

                    return c;
                }, this));

            }.bind(this), 'compare');
        }.bind(this));
    }

    return {
        viewModel: FunnelLayout,
        template: templateMarkup,
        dispose: function () {
            return;
        }
    };
});
