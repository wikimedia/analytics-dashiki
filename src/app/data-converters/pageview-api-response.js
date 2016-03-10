/**
 * This module returns a method that knows how to translate json data from
 *  pageview API to the canonical format understood by dashiki

 * Responses from pageview api look like:
{"items":[
{"project":"en.wikipedia","access":"user","agent":"all-agents","granularity":"daily","timestamp":"2015120200","views":291268249},
{"project":"en.wikipedia","access":"user","agent":"all-agents","granularity":"daily","timestamp":"2015120300","views":284829416},
{"project":"en.wikipedia","access":"user","agent":"all-agents","granularity":"daily","timestamp":"2015120400","views":280259970}
]
*/
define(function (require) {
    'use strict';

    var _ = require('lodash'),
        moment = require('moment'),
        TimeseriesData = require('converters.timeseries');

    /**
     * Parameters
     *   options    : a dictionary of options.  Required options:
     *
     *   rawData    : json data, as fetched from the pageview API public endpoint
     * Returns
     *   A TimeseriesData instance
     */

    return function () {

        return function (options, rawData) {

            var opt = $.extend({
                label: '',

            }, options);

            if (!_.has(rawData, 'items')) {
                return new TimeseriesData([]);
            }

            // transform array of items into hash so TimeSeries data can digest it
            var dict = {};
            _.forEach(rawData.items, function (value) {
                var ts = moment(value.timestamp, 'YYYYMMDDHH').format('YYYY-MM-DD');

                dict[ts] = [
                    [value.views ? parseFloat(value.views) : null]
                ];
            });

            return new TimeseriesData(
                // use the label passed in as the header
                [opt.label],
                dict,
                // color based on the label passed in
                [opt.label],
                // custom pattern if needed
                [opt.pattern],
                // we're guaranteed the API only returns one item per date
                false
            );
        };
    };
});
