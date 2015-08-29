/**
 * Different async observables that simplify data fetching and transformation
 **/
define(function (require) {
    'use strict';

    var ko = require('knockout'),
        TimeseriesData = require('converters.timeseries');

    return {

        /**
         * Asynchronously gets data for a single side of an A/B comparison
         * Does not care whether A or B is shown, only cares about observing
         * changes that would affect data
         */
        asyncData: function(api, metricInfo, constantWiki) {
            var result = ko.observable(new TimeseriesData([]));

            ko.computed(function () {
                var wiki = constantWiki || ko.unwrap(this.wiki.selected),
                    from = ko.unwrap(this.fromDate.selected),
                    to = ko.unwrap(this.toDate.selected);

                api.getData(metricInfo, wiki).done(function(data) {
                    result(data.filter(from, to));
                });

            }, this).extend({ rateLimit: 0 });

            return result;
        }
    };
});
