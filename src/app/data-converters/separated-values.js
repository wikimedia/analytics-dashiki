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

        return function (options, rawData) {

            var opt = $.extend({
                label: '(not named)',
                lineSeparator: '\n',
                valueSeparator: valueSeparator,
                showBreakdown: false,

            }, options);

            var rows = rawData.split(opt.lineSeparator).map(function (row) {
                return row.split(opt.valueSeparator);
            });

            var header = rows.splice(0, 1)[0],
                mainColumn = opt.columnToUse || header[1],
                mainColumnIndex = header.indexOf(mainColumn),
                allColumns = [mainColumn];

            if (opt.showBreakdown) {
                allColumns = allColumns.concat(opt.breakdownColumns);
            }

            var data = rows.map(function (row) {

                // some records are bad, filter them
                var date = moment(row[0]).toDate().getTime();
                var value = parseInt(row[mainColumnIndex], 10);

                if (date && value && !isNaN(date) && !isNaN(value)) {
                    // NOTE: for demos until we add a time-selector, uncomment this line:
                    //if (date < 1413836239592) return [];
                    return allColumns.map(function (column) {
                        return {
                            date: date,
                            color: opt.label,
                            label: opt.showBreakdown ? opt.label + ': ' + column : opt.label,
                            value: parseInt(row[header.indexOf(column)], 10),
                            type: column,
                            main: column === mainColumn,
                        };
                    });
                }
            });
            data = [].concat.apply([], data);

            return data.sort(function (a, b) {
                return a.date - b.date;
            }).filter(function (item) {
                // make sure not to return 'undefined' items
                return item;
            });
        };
    };
});
