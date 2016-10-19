/**
 * This module returns a function that parses a Wiki article which
 *   holds annotations in a pre-defined format:
 *
 * [
 *   {
 *     "start": "2014-12-25", "end": "2015-01-01",
 *     "note": "information about this range of dates"
 *   }
 * ]
 *
 * Parameters for the generated function:
 *  label               : Used for header, colors, etc. default '(annotations)'
 *  startRangePrefix    : Prefixed to notes that have a range. default 'Start: '
 *  endRangePrefix      : Prefixed to notes that have a range. default 'End: '
 */
'use strict';
define(function (require) {

    var _ = require('lodash'),
        TimeseriesData = require('models.timeseries');

    return function () {

        return function (options, rawData) {

            var opt = $.extend({
                label: '(annotations)',
                startRangePrefix: 'Begin: ',
                endRangePrefix: 'End: ',
            }, options);

            var ret = _.attempt(function () {
                var duplicateDates = false;

                var notesByDate = _(rawData).transform(function (result, annotation) {
                    if (!annotation || !annotation.start) {
                        return true;
                    }

                    if (annotation.end && (annotation.start !== annotation.end)) {
                        result.push([annotation.start, opt.startRangePrefix + annotation.note]);
                        result.push([annotation.end, opt.endRangePrefix + annotation.note]);
                    } else {
                        result.push([annotation.start, annotation.note]);
                    }

                }).transform(function (result, annotation) {

                    if (_.has(result, annotation[0])) {
                        duplicateDates = true;
                    } else {
                        result[annotation[0]] = [];
                    }
                    result[annotation[0]].push(annotation.splice(1));

                }, {}).value();

                return new TimeseriesData(
                    [opt.label],
                    notesByDate,
                    [opt.label],
                    [opt.label],
                    duplicateDates
                );
            });

            return _.isError(ret) ? new TimeseriesData() : ret;
        };
    };
});
