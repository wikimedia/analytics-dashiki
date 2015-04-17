// NOTE: a few oddities remain from when this was hardcoded to
// compare only visual editor and wikitext, but it's much cleaner
define(function (require) {
    'use strict';

    var ko = require('knockout'),
        templateMarkup = require('text!./compare-layout.html'),
        apiFinder = require('api-finder'),
        configApi = require('apis.config'),
        marked = require('marked'),
        moment = require('moment'),
        utils = require('utils'),
        asyncObs = require('observables.async');

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
            format: utils.formatDate,
        };
        this.toDate = {
            options: ko.computed(function() {
                return this.dates().filter(function (d) {
                    return d >= (this.fromDate.selected() || '');
                }, this);
            }, this),
            selected: ko.observable(),
            format: utils.formatDate,
            defaultToLast: true,
        };
        this.fromDate.selected.subscribe(function (newFromDate) {
            if (newFromDate > this.toDate.selected()) {
                this.toDate.selected(newFromDate);
            }
        }, this);
        this.timespan = ko.computed(function() {
            return utils.timespan(this.fromDate.selected(), this.toDate.selected());
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
                    this.defaultToLast ? changedOptions.length-1 : 0
                ]);
            }, single);
        });

        // Observing whether a or b are supposed to show separately would
        // cause thrashing, so we make a single computed that changes both
        // together
        this.showAB = ko.pureComputed(function () {
            return {
                a: this.comparable.selected() !== this.config.b,
                b: this.comparable.selected() !== this.config.a,
            };
        }, this);

        this.comparisons = ko.observable([]);

        // *** Get this dashboard's configuration and load it up
        // (wait for wikis to be done loading otherwise we thrash
        wikiPromise.done(function (){
            configApi.getDefaultDashboard(function (config) {

                this.config = config;

                // dates
                var days = moment
                    .twix(new Date(config.startDate), new Date())
                    .iterate('days');
                var dates = [];
                while (days.hasNext()) {
                    dates.push(days.next());
                }
                this.dates(dates);

                // comparables (whatever you're A/B comparing)
                this.comparable.options([config.a, 'Both', config.b]);

                // comparisons
                var asyncMergedDataForAB = asyncObs.asyncMergedDataForAB.bind(this),
                    asyncData = asyncObs.asyncData.bind(this),
                    api = apiFinder({api: 'datasets'});

                this.comparisons(config.comparisons.map(function (c) {
                    c.data = {
                        showAB: this.showAB,
                    };
                    if (c.type === 'timeseries') {
                        c.data = asyncMergedDataForAB(api, c.metric, config.a, config.b);
                    }
                    else if (c.type === 'sunburst') {
                        c.data.a = {
                            label: config.a,
                            data: asyncData(api, c.metric, config.a)
                        };
                        c.data.b = {
                            label: config.b,
                            data: asyncData(api, c.metric, config.b),
                        };
                    }
                    c.desc = c.desc ? marked(c.desc, {sanitize: true}) : '';

                    if (c.annotationsMetric) {
                        // use 'all' as the constant wiki, annotations don't vary by wiki
                        c.annotations = asyncData(api, c.annotationsMetric, config.a, 'all');
                    }

                    if (c.colors) {
                        var colors = c.colors;
                        c.colors = function (label) {
                            return colors[label];
                        };
                    }

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
