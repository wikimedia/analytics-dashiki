/**
 * This module returns a method that knows how to parse a file with values
 *   separated by arbitrary characters on lines separated by arbitrary characters
 */
'use strict';
define(function (require) {

    var stringUtils = require('utils.strings');

    /**
     * Parses a CSV, TSV, or similar into an array of rows.
     * The TSV must have a header row.
     * Looks at the second row to determine data type and applies that,
     *   by column, to the rest of the rows.
     */
    return function (valueSeparator) {

        return function (options, rawData) {

            var opt = $.extend({
                lineSeparator: '\n',
                valueSeparator: {
                    tsv: '\t',
                    csv: ',',
                }[valueSeparator],

            }, options);

            var rows = rawData.split(opt.lineSeparator)
                .filter(function (line) {
                    return line && line.length && line.length > 1;
                }).map(function (line) {
                    return line.split(opt.valueSeparator);
                });

            if (rows.length <= 1) { return []; }

            // try to determine the type of each column
            var parsers = rows[1].map(stringUtils.parserFromSample);
            var trimmer = function (s) { return s.trim(); };

            // NOTE: will return the header but take care not to parse it
            return rows.map(function (row, rowIndex) {
                return rowIndex === 0 ?
                    row.map(trimmer) :
                    row.map(function (value, index) {
                        return parsers[index](value);
                    });
            });
        };
    };
});
