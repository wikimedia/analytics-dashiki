'use strict';

/**
 * This module returns a method that knows how to translate json data
 * from AQS to the canonical format understood by dashiki.
 *
 * Responses from AQS look like:
 * {"items":[
 *   {"project":"en.wikipedia","access":"user","agent":"all-agents","granularity":"daily","timestamp":"2015120200","views":291268249},
 *   {"project":"en.wikipedia","access":"user","agent":"all-agents","granularity":"daily","timestamp":"2015120300","views":284829416},
 *   {"project":"en.wikipedia","access":"user","agent":"all-agents","granularity":"daily","timestamp":"2015120400","views":280259970}
 * ]
 * where the field that contains the actual values may be 'views' or 'devices'
 * depending on the API.
*/
define(function (require) {

    var _ = require('lodash'),
        moment = require('moment'),
        TimeseriesData = require('converters.timeseries');

    /**
     * Parameters
     *   valueField     : A string indicating the field that holds the values
     *                    within the results of the AQS response.
     */
    return function (valueField) {

        /**
         * Parameters
         *   options    : A dictionary of options.
         *   rawData    : Json data, as fetched from the AQS public endpoint.
         * Returns
         *   A TimeseriesData instance
         */
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
                    [value[valueField] ? parseFloat(value[valueField]) : null]
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
