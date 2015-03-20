// NOTE: not generic for all A/B comparison, visualEditor and wikitext are hardcoded
// NOTE: some configuration is hard-coded for now
define(function (require) {
    'use strict';

    var ko = require('knockout'),
        d3 = require('d3'),
        templateMarkup = require('text!./funnel-layout.html'),
        apiFinder = require('app/apis/api-finder'),
        marked = require('marked'),
        moment = require('moment'),
        utils = require('utils'),

        visualEditor = 'visualeditor',
        wikitext = 'wikitext';

    // needed for the popup binding
    require('app/global-bindings');
    require('twix');

    function FunnelLayout() {
        this.wiki = {
            options: ko.observable([]),
            selected: ko.observable('all'),
        };
        var wikimetricsApi = apiFinder({api: 'wikimetrics'});
        wikimetricsApi.getProjectAndLanguageChoices(function (data) {
            var databases = Object.getOwnPropertyNames(data.reverseLookup).sort();
            this.wiki.options(['all'].concat(databases));
        }.bind(this));

        var formatDate = function (d) { return d.format('YYYY-MM-DD'); };
        var days = moment
            .twix(new Date('2015-04-01'), new Date('2015-07-01'))
            .iterate('days');

        this.dates = [];
        while (days.hasNext()) {
            this.dates.push(days.next());
        }
        this.fromDate = {
            options: this.dates,
            selected: ko.observable(this.dates[0]),
            format: formatDate,
        };
        this.toDate = {
            options: ko.computed(function() {
                return this.dates.filter(function (d) {
                    return d >= this.fromDate.selected();
                }, this);
            }, this),
            selected: ko.observable(this.dates[this.dates.length-1]),
            format: formatDate,
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

        this.editor = {
            options: ko.observable([visualEditor, 'Both', wikitext]),
            selected: ko.observable(visualEditor),
        };

        // veActive and wtActive can't be observables because when editor.selected
        // changes, they would change one at a time instead of together.
        // Instead, we make a single computed generic for A/B display
        this.showAB = ko.pureComputed(function () {
            return {
                a: this.editor.selected() !== wikitext,
                b: this.editor.selected() !== visualEditor,
            };
        }, this);

        this.api = apiFinder({api: 'datasets'});

        /**
         * Asynchronously gets data for one or both sides of the A/B comparison and
         *   merges it into a single dataset with a superheader row that labels each
         *   column with the side of the comparison it belongs to
         */
        var asyncMergedData = function (metric) {
            var noResult = {
                primary: visualEditor,
                header: [],
                rows: []
            };
            var result = ko.observable(noResult);

            ko.computed(function(){
                var wiki = ko.unwrap(this.wiki.selected),
                    from = ko.unwrap(this.fromDate.selected),
                    to = ko.unwrap(this.toDate.selected),
                    showAB = ko.unwrap(this.showAB);

                var promises = [],
                    editors = [];

                if (showAB.a) {
                    promises.push(this.api.getData(metric, visualEditor, wiki));
                    editors.push(visualEditor);
                }
                if (showAB.b) {
                    promises.push(this.api.getData(metric, wikitext, wiki));
                    editors.push(wikitext);
                }

                $.when.apply(this, promises).then(function (dataA, dataB) {
                    var mergedData = $.extend({}, noResult);

                    // if just one promise was made, simply return the result
                    if ((dataA && dataA.length) && !(dataB && dataB.length)) {
                        mergedData.header = dataA.splice(0, 1)[0];
                        mergedData.label = mergedData.header.map(function () {
                            return editors[0];
                        });
                        mergedData.rows = dataA.filter(function (row) {
                            return from <= row[0] && row[0] <= to;
                        });
                    } else {

                        // for multiple results, zip together taking care to match dates
                        var dataByDate = {},
                            columnsSoFar = 0,
                            filler = function (n) {
                                return d3.range(n).map(function () {
                                    return null;
                                });
                            },
                            rawData = [], i;

                        mergedData.label = ['Date'];
                        mergedData.header = ['Date'];
                        mergedData.rows = [];

                        for (i = 0; i < arguments.length; i++) {
                            rawData.push(arguments[i]);
                        }
                        editors.forEach(function (editor, argIndex) {
                            var data = rawData[argIndex];

                            if (data && data.length && data.length > 1) {
                                // get all but the first column of the first row
                                var header = data.splice(0, 1)[0].splice(1);

                                // insert the data for each row into its proper date key
                                data.forEach(function (r) {
                                    var date = r.splice(0, 1)[0],
                                        time = date.getTime();
                                    // use the main date filters to reduce data right away
                                    if (!(from <= date && date <= to)) { return; }

                                    if (!dataByDate.hasOwnProperty(time)) {
                                        // fill in null values in case we're inserting into
                                        // a date that hasn't seen a row yet
                                        dataByDate[time] = filler(columnsSoFar);
                                    }
                                    dataByDate[time] = dataByDate[time].concat(r);
                                });

                                mergedData.header = mergedData.header.concat(header);
                                mergedData.label = mergedData.label.concat(header.map(function(){
                                    return editor;
                                }));

                                columnsSoFar = mergedData.header.length - 1;
                            }
                        });
                        // outside the loop, when all dates are resolved,
                        // fill the rows with sorted filtered, column-aligned data
                        mergedData.rows = Object.getOwnPropertyNames(dataByDate)
                                                .sort()
                                                .map(function (time) {
                                                    return [new Date(+time)].concat(
                                                        dataByDate[time]
                                                    );
                                                });
                    }

                    // can be set in either branch above or left empty when
                    // no promises return data
                    result(mergedData);
                });

            // Allow multiple filter changes to happen before reacting,
            //   to avoid computing multiple times
            }, this).extend({ rateLimit: 0 });

            return result;
        }.bind(this);

        /**
         * Asynchronously gets data for a single side of the A/B comparison
         * Does not care whether A or B is shown, only cares about observing
         * changes that would affect data
         */
        var asyncData = function(metric, editor, constantWiki) {
            var result = ko.observable({
                header: [],
                rows: [],
            });

            ko.computed(function () {
                var wiki = constantWiki || ko.unwrap(this.wiki.selected),
                    from = ko.unwrap(this.fromDate.selected),
                    to = ko.unwrap(this.toDate.selected);

                this.api.getData(metric, editor, wiki).done(function(data) {
                    result({
                        header: data.slice(0,1)[0],
                        rows: data.slice(1).filter(function (row) {
                            return from <= row[0] && row[0] <= to;
                        })
                    });
                });

            }, this).extend({ rateLimit: 0 });

            return result;
        }.bind(this);

        this.comparisons = [
            {
                title: 'Sequence of Actions',
                type: 'sunburst',
                metric: 'sessions',
                desc: marked('An editor goes through a sequence of events during an editing session.  Similar sessions are aggregated and represented as proportional concentric arcs.\n\n  At a glance, you can see the proportion of important steps, such as successful saves colored in green.  If you look closer, you can identify longer thinner rays that represent rare but interesting ways people are using the tool.', {sanitize: true}),
                colors: function(name) {
                    return {
                        'init': '#5687d1',
                        'ready': '#7b615c',
                        'saveIntent': '#de783b',
                        'saveAttempt': '#17becf',
                        'saveSuccess': '#6ab975',
                        'saveFailure': '#a173d1',
                        'abort': '#bcbd22',
                        'end': '#bbbbbb'
                    }[name];
                },
            },
            {
                title: 'Rates over time',
                type: 'timeseries',
                metric: 'rates',
                desc: marked('Interesting rates are examined over time.\n\n* bounce-rate: loaded the editor but did not go beyond that\n* success-rate: attempted to save and were able to\n* failure-rate: attempted to save and were met with an application exception or a workflow exception such as an edit conflict\n* not-attempted-rate: began the save process but did not attempt to save', {sanitize: true}),
                colors: function(name) {
                    return {
                        'not-attempted-rate': '#7b615c',
                        'success-rate': '#6ab975',
                        'failure-rate': '#a173d1',
                        'bounce-rate': '#bcbd22',
                    }[name];
                }
            },
            {
                title: 'Success by Experience of User',
                type: 'timeseries',
                metric: 'success_by_user_type',
                desc: marked('***', {sanitize: true}),
            },
            {
                title: 'Failure Rates by Type',
                type: 'timeseries',
                metric: 'failure_rates_by_type',
                desc: marked('***', {sanitize: true}),
            },
        ];
        this.comparisons.forEach(function (c) {
            c.data = {
                showAB: this.showAB,
            };
            if (c.type === 'timeseries') {
                c.data = asyncMergedData(c.metric);
                // specify constant values for parameters because
                // deployments aren't tracked by wiki yet
                c.annotations = asyncData('deployments', visualEditor, 'all');
            }
            else if (c.type === 'sunburst') {
                c.data.a = {
                    label: visualEditor,
                    data: asyncData(c.metric, visualEditor)
                };
                c.data.b = {
                    label: wikitext,
                    data: asyncData(c.metric, wikitext),
                };
            }
        }, this);
    }

    return {
        viewModel: FunnelLayout,
        template: templateMarkup,
        dispose: function () {
            this.editorSubscriber.dispose();
        }
    };
});
