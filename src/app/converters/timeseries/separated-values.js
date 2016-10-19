/**
 * This module returns a method that knows how to parse a file with values
 *   separated by arbitrary characters on lines separated by arbitrary characters
 */
'use strict';
define(function (require) {

    var _ = require('lodash'),
        TimeseriesData = require('models.timeseries');

    /**
     * Parses a CSV, TSV, or similar using some assumptions:
     *  * The first row in the file is a header row
     *  * The first column in the file is a date column
     *
     * Important: each date can have more than one row associated.  In this case,
     * an array of rows is associated with the date instead of just a single row
     *
     * Parameters for the generated function:
        label           : Used for consistent colors or patterns, default ''
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
                label: '',
                lineSeparator: '\n',
                valueSeparator: valueSeparator,
                allColumns: true,
                varyPatterns: false,
                varyColors: false,
                globalPattern: false,
                doNotParse: [],

            }, options);

            if (rawData.indexOf(opt.valueSeparator) < 0 ||
                rawData.indexOf(opt.lineSeparator) < 0) {
                return new TimeseriesData();
            }

            var rows = rawData.split(opt.lineSeparator).map(function (row) {
                return row.split(opt.valueSeparator);
            });

            var header = rows
                            // grab the first row and treat it as the header (required)
                            .splice(0, 1)[0]
                            // always skip the first column because that's the date
                            .splice(1, opt.allColumns ? rows[0].length : 1)
                            // trim to prevent confusion with configured colors, etc.
                            .map(function (col) {
                                return col.trim();
                            }),

                colorLabels = opt.varyColors ?
                    header : _.fill(Array(header.length), opt.label),

                patternLabels = opt.varyPatterns ?
                    header : _.fill(Array(header.length), opt.globalPattern ? 0 : opt.label),

                rowsByDate = {},
                duplicateDates = false;

            _.forEach(rows, function (row) {
                var value = row.splice(1);
                // start date
                if (opt.startDate && row[0] < opt.startDate) {
                    return true;
                }

                if (_.has(rowsByDate, row[0])) {
                    duplicateDates = true;
                } else {
                    rowsByDate[row[0]] = [];
                }

                rowsByDate[row[0]].push(
                    _(value).take(header.length).map(function (v, i) {
                        if (_.includes(opt.doNotParse, header[i])) {
                            return v;
                        }
                        v = v.trim();
                        if (v.length === 0) {
                            return null;
                        }
                        // force numbers if possible
                        var parsed = parseFloat(v);
                        return isNaN(parsed) ? v : parsed;
                    }).value()
                );
            });

            return new TimeseriesData(
                header,
                rowsByDate,
                colorLabels,
                patternLabels,
                duplicateDates
            );
        };
    };
});
