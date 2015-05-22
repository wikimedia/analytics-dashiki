/**
 * Defines TimeseriesData, which structures its constructor parameters
 * into a standard object that is understood by the rest of dashiki and
 * provides an API that the data pipeline can depend on.
 *
 * Parameters
 *  header          : [string] with column labels, excluding the first column, "date"
 *  rowsByDate      : dictionary of date strings to rows, each row is aligned with header
 *  colorLabels     : [string] color keys for each column, aligned with header
 *                      default: a copy of header
 *  patternLabels   : [string] pattern keys for each column, aligned with header
 *                      default: a copy of header
 *
 * Example Input:
 *  ['col1', 'col2'],           // header
 *  {
 *     '2015-01-01': [10, 20],
 *     '2015-01-02': [11, 21],
 *     '2015-01-03': [12, 22],
 *  },                          // rowsByDate
 *  ['col1', 'col2'],           // colorLabels
 *  ['dataset1', 'dataset1'],   // patternLabels
 */
define(function (require) {
    'use strict';

    var _ = require('lodash');

    function TimeseriesData () {
        this.init.apply(this, arguments);
    }

    TimeseriesData.prototype.init = function (
        header, rowsByDate, colorLabels, patternLabels
    ) {
        // default to the header if nothing passed in
        colorLabels = colorLabels || header;
        patternLabels = patternLabels || header;

        // default to no rowsByDate if nothing passed in
        rowsByDate = rowsByDate || {};

        // make sure header and labels are all aligned (same size)
        if (header.length !== colorLabels.length) {
            throw 'ArgError: colorLabels must be aligned in size with the header';
        }
        if (header.length !== patternLabels.length) {
            throw 'ArgError: patternLabels must be aligned in size with the header';
        }

        this.header = header;
        this.colorLabels = colorLabels;
        this.patternLabels = patternLabels;
        this.rowsByDate = rowsByDate;
    };

    /**
     * This important function allows multiple TimeseriesData objects to
     * be merged together efficiently.  It not only merges headers and labels,
     * but also zips up rowsByDate by date, filling date gaps in source or destination
     * with null values
     *
     * Adds `this` to the input array and calls mergeAll
     *
     * Parameters
     */
    TimeseriesData.prototype.merge = function (from) {
        if (_.isUndefined(from)) {
            return this;
        }
        if (!_.isArray(from)) {
            from = [from];
        }
        from.splice(0, 0, this);

        return TimeseriesData.mergeAll(from);
    };

    /**
     * Merges an array of TimeseriesData objects
     */
    TimeseriesData.mergeAll = function (arrayOfTimeseries) {

        var rest = arrayOfTimeseries.splice(1),
            first = arrayOfTimeseries[0],

            merged = {
                header: _.clone(first.header),
                rowsByDate: _.cloneDeep(first.rowsByDate),
                colorLabels: _.clone(first.colorLabels),
                patternLabels: _.clone(first.patternLabels)
            };

        _.reduce(rest, function (dest, src) {
            _.map(src.rowsByDate, function (value, key) {
                if (!_.has(dest.rowsByDate, key)) {
                    // fill arrays that are nonexistent up to this point
                    dest.rowsByDate[key] = _.fill(Array(dest.header.length), null);
                }
                dest.rowsByDate[key] = dest.rowsByDate[key].concat(value);
            });

            _.map(['header', 'colorLabels', 'patternLabels'], function (key) {
                dest[key] = dest[key].concat(src[key]);
            });

            // make sure each row lines up with the new concatenated header
            _.each(dest.rowsByDate, function (value) {
                var oldLength = value.length;
                value.length = dest.header.length;
                _.fill(value, null, oldLength);
            });

            return dest;
        }, merged);

        return new TimeseriesData(
            merged.header,
            merged.rowsByDate,
            merged.colorLabels,
            merged.patternLabels
        );
    };

    /**
     * Materializes the lodash chainable rowsByDate property and sorts it by date
     */
    TimeseriesData.prototype.rowData = function () {
        return _(this.rowsByDate).map(function (value, key) {
            var date = _.attempt(function () {
                return new Date(key).getTime();
            });
            // don't output invalid dates
            return _.isError(date) ? null : [date].concat(value);

        }).filter(function (row) {
            return !isNaN(row[0]);
        }).sortBy(function (row) {
            return row[0];
        }).value();
    };

    return TimeseriesData;
});

