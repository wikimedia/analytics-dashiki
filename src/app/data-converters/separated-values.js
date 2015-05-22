/**
 * This module returns a method that knows how to parse a file with values
 *   separated by arbitrary characters on lines separated by arbitrary characters
 */
define(function (require) {
    'use strict';

    var _ = require('lodash'),
        TimeseriesData = require('converters.timeseries');

    /**
     * Parses a CSV, TSV, or similar using some assumptions:
     *  * The first row in the file is a header row
     *  * The first column in the file is a date column
     *
     * Parameters for the generated function:
        label           : Used for consistent colors or patterns, default '(not named)'
        lineSeparator   : Split the input lines, default '\n'
        valueSeparator  : Split the input rows, default valueSeparator from parent
        allColumns      : Return all columns from the dataset, default true
        varyPatterns    : Match the header row in the pattern labels, default false
        varyColors      : Match the header row in the color labels, default false
        globalPattern   : If varyPatterns is false, makes globally consistent pattern labels, default false
     */
    return function (valueSeparator) {

        return function (options, rawData) {

            var opt = $.extend({
                label: '(not named)',
                lineSeparator: '\n',
                valueSeparator: valueSeparator,
                allColumns: true,
                varyPatterns: false,
                varyColors: false,
                globalPattern: false,

            }, options);

            var rows = rawData.split(opt.lineSeparator).map(function (row) {
                return row.split(opt.valueSeparator);
            });

            var header = rows
                            // grab the first row and treat it as the header (required)
                            .splice(0, 1)[0]
                            // always skip the first column because that's the date
                            .splice(1, opt.allColumns ? rows[0].length : 1),

                colorLabels = opt.varyColors
                    ? header
                    : _.fill(Array(header.length), opt.label),

                patternLabels = opt.varyPatterns
                    ? header
                    : _.fill(Array(header.length), opt.globalPattern ? 0 : opt.label),

                rowsByDate = {};

            _.forEach(rows, function (row) {
                var value = row.splice(1);
                // start date
                if (opt.startDate && row[0] < opt.startDate) {
                    return true;
                }
                rowsByDate[row[0]] = _(value).take(header.length).map(function (v) {
                    // force numbers to numbers, strings to strings, and the rest to null
                    var number = parseFloat(v);
                    return isNaN(number)
                        ? v ? v : null
                        : number;
                }).value();
            });

            return new TimeseriesData(
                header,
                rowsByDate,
                colorLabels,
                patternLabels
            );
        };
    };
});
