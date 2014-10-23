/**
 * This module returns a method that knows how to parse a file with values
 *   separated by arbitrary characters on lines separated by arbitrary characters
 */
define(['moment'], function (moment) {

    /**
     * Parses a CSV, TSV, or similar using some assumptions:
     *  * The first row in the file is a header row
     *  * The first column in the file is a date column
     *  * The default column to get values from is the second column
     */
    return function (valueSeparator) {
        var self = this;
        // adding 1 level of indirection to deal with value separators
        var valueSeparator = valueSeparator;

        return function (options, rawData) {

            var opt = $.extend({
                label: '(not named)',
                lineSeparator: '\n',
                valueSeparator: valueSeparator,
            }, options);



            var rows = rawData.split(opt.lineSeparator).map(function (row) {
                return row.split(opt.valueSeparator);
            });

            var header = rows.splice(0, 1)[0],
                valueColumn = opt.columnToUse ? header.indexOf(opt.columnToUse) : 1;

            var data = rows.map(function (row) {

                //some records are bad, filter them
                var date = moment(row[0]).toDate().getTime();
                var value = parseInt(row[valueColumn]);

                if (date && value && !isNaN(date) && !isNaN(value)) {
                    return {
                        date: moment(row[0]).toDate().getTime(),
                        label: opt.label,
                        value: value,
                    };
                }

            }).sort(function (a, b) {
                return a.date - b.date;
            }).filter(function (item) {
                //make sure not to return 'undefined' items
                return item;
            });

            return data;
        };


    }
});