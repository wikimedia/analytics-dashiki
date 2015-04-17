/**
 * Different async observables that simplify data fetching and transformation
 **/
define(function (require) {
    'use strict';

    var utils = require('utils'),
        ko = require('knockout');

    return {
        /**
         * Asynchronously gets data for one or both sides of the A/B comparison and
         *   merges it into a single dataset with a superheader row that labels each
         *   column with the side of the comparison it belongs to
         */
        asyncMergedDataForAB: function (api, metric, a, b) {
            var noResult = {
                primary: a,
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
                    comparables = [];

                if (showAB.a) {
                    promises.push(api.getData(metric, a, wiki));
                    comparables.push(a);
                }
                if (showAB.b) {
                    promises.push(api.getData(metric, b, wiki));
                    comparables.push(b);
                }

                $.when.apply(this, promises).then(function (dataA, dataB) {
                    var mergedData = $.extend({}, noResult);

                    // if just one promise was made, simply return the result
                    if ((dataA && dataA.length) && !(dataB && dataB.length)) {
                        mergedData.header = dataA.splice(0, 1)[0];
                        mergedData.label = mergedData.header.map(function () {
                            return comparables[0];
                        });
                        mergedData.rows = dataA.filter(function (row) {
                            return from <= row[0] && row[0] <= to;
                        });
                    } else {

                        // for multiple results, zip together taking care to match dates
                        var dataByDate = {},
                            columnsSoFar = 0,
                            rawData = [], i;

                        mergedData.label = ['Date'];
                        mergedData.header = ['Date'];
                        mergedData.rows = [];

                        for (i = 0; i < arguments.length; i++) {
                            rawData.push(arguments[i]);
                        }
                        comparables.forEach(function (comparable, argIndex) {
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
                                        // fill with undefined in case we're inserting into
                                        // a date that hasn't seen a row yet
                                        dataByDate[time] = utils.filler(columnsSoFar);
                                    }
                                    dataByDate[time] = dataByDate[time].concat(r);
                                });

                                mergedData.header = mergedData.header.concat(header);
                                mergedData.label = mergedData.label.concat(header.map(function(){
                                    return comparable;
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
        },

        /**
         * Asynchronously gets data for a single side of an A/B comparison
         * Does not care whether A or B is shown, only cares about observing
         * changes that would affect data
         */
        asyncData: function(api, metric, comparable, constantWiki) {
            var result = ko.observable({
                header: [],
                rows: [],
            });

            ko.computed(function () {
                var wiki = constantWiki || ko.unwrap(this.wiki.selected),
                    from = ko.unwrap(this.fromDate.selected),
                    to = ko.unwrap(this.toDate.selected);

                api.getData(metric, comparable, wiki).done(function(data) {
                    result({
                        header: data.slice(0,1)[0],
                        rows: data.slice(1).filter(function (row) {
                            return from <= row[0] && row[0] <= to;
                        })
                    });
                });

            }, this).extend({ rateLimit: 0 });

            return result;
        }
    };
});
