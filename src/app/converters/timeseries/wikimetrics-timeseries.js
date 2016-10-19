/**
 * This module returns a method that knows how to translate json data from
 *   wikimetrics to the canonical timeseries format understood by dashiki
 */
'use strict';
define(function (require) {

    var _ = require('lodash'),
        TimeseriesData = require('models.timeseries');

    /**
     * Parameters
     *   options    : a dictionary of options.  Required options:
     *     defaultSubmetrics - dictionary of metric names to default submetrics to use
     *
     *   rawData            : Wikimetrics json data, as fetched from a Wikimetrics
     *                        public report result file
     *
     * Returns
     *   A TimeseriesData instance
     */

    return function () {

        return function (options, rawData) {

            if (!_.has(rawData, 'parameters.Metric')) {
                return new TimeseriesData([]);
            }

            var parameters = rawData.parameters,
                metricName = parameters.Metric,
                submetric = options.defaultSubmetrics[metricName];

            if (!_.has(rawData, 'result.Sum[' + submetric + ']')) {
                return new TimeseriesData([parameters.cohort]);
            }

            return new TimeseriesData(
                // labels and colors can use the cohort name
                [parameters.Cohort],
                // wrap the values in an array to match the header
                _.forEach(rawData.result.Sum[submetric], function (value, key, dict) {
                    dict[key] = [[value ? parseFloat(value) : null]];
                }),
                [parameters.Cohort],
                // but keep patterns globally constant
                [0]
            );
        };
    };
});
