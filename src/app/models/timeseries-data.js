/**
 * Defines TimeseriesData, which structures its constructor parameters
 * into a standard object that is understood by the rest of dashiki and
 * provides an API that the data pipeline can depend on.
 *
 * Parameters
 *  header          : [string] with column labels, excluding the first column, "date"
 *  rowsByDate      : dictionary from a date to an array of rows,
 *                      if duplicateDates is false, each array only has one row
 *                      if duplicateDates is true, this can not be merged with
 *                        other TimeseriesData and each array has multipe rows
 *                      in either case, each row is aligned with the header
 *  colorLabels     : [string] color keys for each column, aligned with the header
 *                      default: a copy of header
 *  patternLabels   : [string] pattern keys for each column, aligned with the header
 *                      default: a copy of header
 *  duplicateDates  : [bool] if true, multiple rows are associated to each date
 *
 * Example Input:
 *  ['col1', 'col2'],           // header
 *  {
 *     '2015-01-01': [[10, 20]],
 *     '2015-01-02': [[11, 21]],
 *     '2015-01-03': [[12, 22]],
 *  },                          // rowsByDate
 *  ['col1', 'col2'],           // colorLabels
 *  ['dataset1', 'dataset1'],   // patternLabels
 */
'use strict';
define(function (require) {

    var _ = require('lodash'),
        moment = require('moment');

    function TimeseriesData() {
        this.init.apply(this, arguments);
    }

    TimeseriesData.prototype.init = function (
        header, rowsByDate, colorLabels, patternLabels, duplicateDates
    ) {
        // default for empty constructor
        header = header || [];

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
        this.duplicateDates = duplicateDates;
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
    TimeseriesData.mergeAll = function (inputArray) {

        var arrayOfTimeseries = [];

        // before merging remove empty entries, defective data ends up
        // creating an empty timeseries
         _.forEach(inputArray, function (t) {
            if (!_.isEmpty(t.rowsByDate)) {
                arrayOfTimeseries.push(t);
            }
        });

        // if the array only has 1 element there is no need to merge
        if (arrayOfTimeseries.length <=1){
            return arrayOfTimeseries[0];
        }

        // check each input, to be merged, they must have one value per date
        _.forEach(arrayOfTimeseries, function (t) {
            if (t.duplicateDates) {
                throw 'Can not be merged: has multiple rows per date.';
            }
        });

        var rest = arrayOfTimeseries.splice(1),
            first = arrayOfTimeseries[0],

            merged = {
                header: _.clone(first.header),
                rowsByDate: _.cloneDeep(first.rowsByDate),
                colorLabels: _.clone(first.colorLabels),
                patternLabels: _.clone(first.patternLabels),
                fromDate: first.fromDate,
                toDate: first.toDate,
            };

        // in the following, we assume no duplicate rows per date, so we index
        // each date value at [0] to get what should be the only row there
        _.reduce(rest, function (dest, src) {
            _.map(src.rowsByDate, function (value, key) {
                if (!_.has(dest.rowsByDate, key)) {
                    // fill arrays that are nonexistent up to this point
                    dest.rowsByDate[key] = [_.fill(Array(dest.header.length), null)];
                }
                dest.rowsByDate[key][0] = dest.rowsByDate[key][0].concat(value[0]);
            });

            _.map(['header', 'colorLabels', 'patternLabels'], function (key) {
                dest[key] = dest[key].concat(src[key]);
            });

            // make sure each row lines up with the new concatenated header
            _.each(dest.rowsByDate, function (value) {
                var oldLength = value[0].length;
                value[0].length = dest.header.length;
                _.fill(value[0], null, oldLength);
            });

            // merge filters to be most exclusive
            dest.fromDate = (isNaN(dest.fromDate) || src.fromDate > dest.fromDate) ? src.fromDate : dest.fromDate;
            dest.toDate = (isNaN(dest.toDate) || src.toDate < dest.toDate) ? src.toDate : dest.toDate;

            return dest;
        }, merged);

        var ret = new TimeseriesData(
            merged.header,
            merged.rowsByDate,
            merged.colorLabels,
            merged.patternLabels

        );
        return ret.filter(merged.fromDate, merged.toDate);
    };

    /**
     * Sets up filters to be used when rowData is called
     * NOTE: This call has no effect until data is materialized
     *
     * Parameters are both coerced to a number because this works for all
     *   intended usages (passing in Date and Moment instances, or milliseconds)
     *
     * Returns this for easy chaining
     */
    TimeseriesData.prototype.filter = function (from, to) {
        this.fromDate = +from;
        this.toDate = +to;
        return this;
    };

    /**
     * Returns the number of rows
     */
    TimeseriesData.prototype.size = function () {
        return _(this.rowsByDate).transform(function (result, rows) {
            result.size = result.size + rows.length;
        }, {size: 0}).value().size;
    };

    /**
     * Filter data by columns
     * @param {Array} header - column names
     * @param {Array} patternLabels - label names
     * @return TimeseriesData
     */
    TimeseriesData.prototype.pickColumns = function (header, patternLabels) {
        var self = this,
            result = {
                header: [],
                colorLabels: [],
                patternLabels: [],
                rowsByDate: {}
            };

        _.forEach(self.rowsByDate, function (row, date) {
            result.rowsByDate[date] = [];
            _.forEach(self.rowsByDate[date], function () {
                result.rowsByDate[date].push([]);
            });
        });

        _.forEach(header, function (h, k) {
            var i = self.header.indexOf(h);

            // make sure the patternLabels also match
            while (self.patternLabels[i] !== patternLabels[k]) {
                i = self.header.indexOf(h, i + 1);
            }

            result.header.push(self.header[i]);
            result.colorLabels.push(self.colorLabels[i]);
            result.patternLabels.push(self.patternLabels[i]);
            _.forEach(result.rowsByDate, function (row, date) {
                _.forEach(result.rowsByDate[date], function (row2, j) {
                    result.rowsByDate[date][j].push(self.rowsByDate[date][j][i]);
                });
            });
        });

        var ret = new TimeseriesData(
            result.header,
            result.rowsByDate,
            result.colorLabels,
            result.patternLabels,
            this.duplicateDates

        );
        return ret.filter(self.fromDate, self.toDate);
    };

    /**
     * Pivot labels from the column "dimension" into columns,
     * by aggregating values from "metric"
     * Easy future improvements: allow custom aggregation, custom defaults
     *
     * @param {String} dimension - the column to pivot by
     * @param {String} metric - the column to aggregate values from
     *
     * @return TimeseriesData
     */
    TimeseriesData.prototype.pivot = function (dimension, metric) {
        var headerDict = {},
            defaultValue = 0,
            dimensionIndex = this.header.indexOf(dimension),
            metricIndex = this.header.indexOf(metric);

        if (dimensionIndex < 0 || metricIndex < 0) {
            var badDimension = dimensionIndex < 0,
                badMetric = metricIndex < 0,
                bothBad = badDimension && badMetric,
                missing = bothBad ? 'dimension and metric' : (badMetric ? 'metric' : 'dimension');
            throw new Error('The ' + missing + ' you specified ' + bothBad ? 'were' : 'was' + ' bad');
        }

        var rowsDictionariesByDate = _.transform(this.rowsByDate, function (result, rows, key) {
            // pivot each row also keeping track of all unique values for the header
            // the result will be a dictionary of sparse dictionaries, keyed by date
            result[key] = _.transform(rows, function(rowDict, row) {
                var dimensionValue = row[dimensionIndex],
                    metricValue = row[metricIndex];
                if (!(dimensionValue in rowDict)) {
                    rowDict[dimensionValue] = 0;
                }

                rowDict[dimensionValue] += metricValue;
                headerDict[dimensionValue] = true;
            }, {});

        }, {});

        // sort the header so output is deterministic
        var header = _.sortBy(Object.keys(headerDict)),
            patternLabels = header.map(function () { return dimension; });

        var rowsByDate = _.transform(rowsDictionariesByDate, function (result, row, key) {
            // fill in the sparse rows by setting a default value for each header column
            _.forEach(header, function (h) {
                if (!(h in row)) {
                    row[h] = defaultValue;
                }
            });
            result[key] = [header.map(function (h) { return row[h]; })];
        }, {});

        return new TimeseriesData(header, rowsByDate, header, patternLabels)
    };

    /**
     * Materializes the lodash chainable rowsByDate property and sorts it by date
     */
    TimeseriesData.prototype.rowData = function (options) {
        options = options || {};

        var self = this;

        var output = _(this.rowsByDate).transform(function (result, rows, key) {
            var date = _.attempt(function () {
                return moment.utc(key).toDate().getTime();
            });
            // don't output invalid dates or dates out of the filter
            if (!(
                    _.isError(date) || isNaN(date) || (self.fromDate && date < self.fromDate) || (self.toDate && date > self.toDate)
                )) {

                // output all rows for this date
                result.push.apply(result, _.map(rows, function (row) {
                    var dateOutput = date;
                    if (options.convertToDate) {
                        dateOutput = moment.utc(date).toDate();
                    }
                    if (options.convertToString) {
                        dateOutput = moment.utc(date).format('YYYY-MM-DD');
                    }
                    return [dateOutput].concat(row);
                }));
            }

        }, []).sortBy(function (row) {
            return row[0];
        });

        if (options.filter) {
            output = output.filter(options.filter);
        }
        if (options.limit) {
            output = output.slice(options.limit.start, options.limit.end);
        }
        return output.value();
    };

    return TimeseriesData;
});
