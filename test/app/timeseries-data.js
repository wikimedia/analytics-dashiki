define(function (require) {
    'use strict';

    var TimeseriesData = require('models.timeseries'),
        _ = require('lodash');

    describe('TimeseriesData class', function () {

        it('should make sure header, colorLabels, and patternLabels are aligned', function () {
            expect(function() {
                TimeseriesData.prototype.init(
                    [1, 2, 3],
                    {},
                    [1, 2],
                    [1, 2]
                );
            }).toThrow('ArgError: colorLabels must be aligned in size with the header');

            expect(function() {
                TimeseriesData.prototype.init(
                    [1, 2, 3],
                    {}
                );
            }).not.toThrow();

            expect(function() {
                TimeseriesData.prototype.init(
                    [1, 2, 3],
                    {},
                    [1, 2, 3],
                    [1, 2, 3]
                );
            }).not.toThrow();
        });

        it('should merge the header and labels', function () {
            var t1 = new TimeseriesData([1, 2, 3], {'2018-01-01': [[1]]}),
                t2 = new TimeseriesData([4, 5], {'2018-01-02': [[2]]}),
                tt = t1.merge(t2);

            expect(tt.header).toEqual([1, 2, 3, 4, 5]);
            expect(tt.colorLabels).toEqual([1, 2, 3, 4, 5]);
            expect(tt.patternLabels).toEqual([1, 2, 3, 4, 5]);
        });

        it('should merge filters correctly', function () {
            var t1 = new TimeseriesData(['filter left'], {'2018-01-01': [[1]]}),
                t2 = new TimeseriesData(['filter right'], {'2018-01-02': [[1]]});

            t1.filter(1, 10);
            expect(t1.merge(t2).fromDate).toEqual(1);

            t1.filter();
            t2.filter(1, 10);
            expect(t1.merge(t2).fromDate).toEqual(1);

            t1.filter(1, 10);
            t2.filter();
            expect(t1.merge(t2).fromDate).toEqual(1);

            t1.filter(1, 10);
            t2.filter(2, 11);
            expect(t1.merge(t2).fromDate).toEqual(2);
            expect(t1.merge(t2).toDate).toEqual(10);

            t1.filter(3, 10);
            t2.filter(2, 11);
            expect(t1.merge(t2).fromDate).toEqual(3);
            expect(t1.merge(t2).toDate).toEqual(10);

            t1.filter(3, 12);
            t2.filter(2, 11);
            expect(t1.merge(t2).fromDate).toEqual(3);
            expect(t1.merge(t2).toDate).toEqual(11);
        });

        it('should handle empty rows', function () {
            var t1 = new TimeseriesData([1, 2], {'2018-01-01': [[]]}),
                t2 = new TimeseriesData([1, 2], {'2018-01-02': [[]]});

            expect(t1.merge(t2).rowData()[0].length).toEqual(5);
        });

        it('should join the rows by date', function () {
            var dates = [],
                dateTimes = [],
                t1 = new TimeseriesData(['col1']),
                t2 = new TimeseriesData(['col2', 'col3']);

            dates[1] = '2014-12-01';
            dates[2] = '2014-12-02';
            dates[3] = '2014-12-03';
            dates[4] = '2014-12-04';
            dates[5] = '2014-12-05';
            dates[6] = '2014-12-06';
            dateTimes = _.map(dates, function (dStr) {
                return new Date(dStr).getTime();
            });

            t1.rowsByDate[dates[1]] = [[10]];
            t1.rowsByDate[dates[2]] = [[20]];
            t1.rowsByDate[dates[3]] = [[30]];
            t1.rowsByDate[dates[5]] = [[50]];

            t2.rowsByDate[dates[2]] = [[20, 20]];
            t2.rowsByDate[dates[4]] = [[40, 40]];
            t2.rowsByDate[dates[5]] = [[50, 50]];
            t2.rowsByDate[dates[6]] = [[60, 60]];

            expect(t1.merge(t2).rowData()).toEqual([
                [dateTimes[1], 10  , null, null],
                [dateTimes[2], 20  , 20  , 20  ],
                [dateTimes[3], 30  , null, null],
                [dateTimes[4], null, 40  , 40  ],
                [dateTimes[5], 50  , 50  , 50  ],
                [dateTimes[6], null, 60  , 60  ],
            ]);

            // the original sets should not be altered
            expect(t1.header).toEqual(['col1']);
            expect(t1.rowData()).toEqual([
                [dateTimes[1], 10],
                [dateTimes[2], 20],
                [dateTimes[3], 30],
                [dateTimes[5], 50],
            ]);
            expect(t2.header).toEqual(['col2', 'col3']);
            expect(t2.rowData()).toEqual([
                [dateTimes[2], 20, 20],
                [dateTimes[4], 40, 40],
                [dateTimes[5], 50, 50],
                [dateTimes[6], 60, 60],
            ]);
        });

        it('should merge multiple instances', function () {
            var t1 = new TimeseriesData([1, 2, 3], {'2018-01-01': [[1]]}),
                t2 = new TimeseriesData([4, 5], {'2018-01-01': [[1]]}),
                t3 = new TimeseriesData([5, 6], {'2018-01-01': [[1]]}),
                tt = t1.merge([t2, t3]);

            expect(tt.header).toEqual([1, 2, 3, 4, 5, 5, 6]);
            expect(tt.colorLabels).toEqual([1, 2, 3, 4, 5, 5, 6]);
            expect(tt.patternLabels).toEqual([1, 2, 3, 4, 5, 5, 6]);
        });

        it('should handle options to rowData', function () {
            var dateStr = '2015-01-01',
                date = new Date(dateStr).getTime(),
                t1 = new TimeseriesData(
                    [1],
                    {
                        '2015-01-01': [[1]],
                        '2015-02-01': [[2]],
                        '2015-03-01': [[3]],
                        '2015-04-01': [[4]]
                    }
                );

            // Date conversion
            expect(t1.rowData({convertToDate: true})[0][0].getTime()).toEqual(date);
            // String conversion
            expect(t1.rowData({convertToString: true})[0][0]).toEqual(dateStr);
            // filter by date string
            expect(t1.rowData({convertToString: true, filter: function (row) {
                return row[0].indexOf('2015-02') >= 0;
            }}).length).toEqual(1);
            expect(t1.rowData({convertToString: true, filter: function (row) {
                return row[0].indexOf('2016-') >= 0;
            }}).length).toEqual(0);
            // limit
            expect(t1.rowData({limit: {start: 1, end: 3}}).length).toEqual(2);
            expect(t1.rowData({limit: {start: 1, end: 3}})[0][1]).toEqual(2);
            expect(t1.rowData({limit: {start: 1, end: 3}})[1][1]).toEqual(3);
        });

        it('should report size correctly', function () {
            var t1 = new TimeseriesData(
                    [1],
                    {
                        '2015-01-01': [[1], [10]],
                        '2015-02-01': [[2]],
                        '2015-03-01': [[3], [30]],
                        '2015-04-01': [[4]]
                    }
                );

            expect(t1.size()).toEqual(6);
        });

        it('should should handle multiple rows per date', function () {
            var date = new Date('2015-01-01').getTime(),
                t1 = new TimeseriesData(
                    [1],
                    {'2015-01-01': [[1], [2]]}
                );

            expect(t1.rowData()).toEqual([
                [date, 1],
                [date, 2],
            ]);
        });

        it('should not merge a TimeseriesData instance with duplicateDates', function () {
            var t1 = new TimeseriesData([1, 2], {'2018-01-01': [[1]]}),
                t2 = new TimeseriesData([1, 2], {'2018-01-02': [[1], [2]]});

            t2.duplicateDates = true;

            expect(function () {
                t1.merge(t2);
            }).toThrow('Can not be merged: has multiple rows per date.');
        });

        it('should filter by column', function () {
            var header = [
                    'bounce-rate',
                    'not-attempted-rate',
                    'success-rate',
                    'failure-rate',
                    'bounce-rate',
                    'not-attempted-rate',
                    'success-rate',
                    'failure-rate'
                ],
                rowsByDate = {
                    '2015-04-01': [[1, 2, 3, 4, 5, 6, 7, 8]],
                    '2015-04-02': [[9, 10, 11, 12, 13, 14, 15, 16]],
                    '2015-04-03': [[17, 18, 19, 20, 21, 22, 23, 24]],
                    '2015-04-04': [[25, 26, 27, 28, 29, 30, 31, 32]]
                },
                colorLabels = [
                    'bounce-rate',
                    'not-attempted-rate',
                    'success-rate',
                    'failure-rate',
                    'bounce-rate',
                    'not-attempted-rate',
                    'success-rate',
                    'failure-rate'
                ],
                patternLabels = ['VE', 'VE', 'VE', 'VE', 'WT', 'WT', 'WT', 'WT'],
                ts = new TimeseriesData(header, rowsByDate, colorLabels, patternLabels),
                filteredTs = ts.pickColumns(
                    ['success-rate', 'failure-rate'], ['VE', 'WT']);

            expect(filteredTs.header).toEqual(['success-rate', 'failure-rate']);
            expect(filteredTs.rowsByDate).toEqual({
                '2015-04-01': [[3, 8]],
                '2015-04-02': [[11, 16]],
                '2015-04-03': [[19, 24]],
                '2015-04-04': [[27, 32]]
            });
            expect(filteredTs.colorLabels).toEqual(['success-rate', 'failure-rate']);
            expect(filteredTs.patternLabels).toEqual(['VE', 'WT']);
        });

        it('should preserve date filters when filtering by column', function () {
            var original = new TimeseriesData(),
                filterDates = original.filter(1400000000000, 1400000000001),
                filteredColumns = filterDates.pickColumns([], []);

            expect(filteredColumns.fromDate).toEqual(1400000000000);
            expect(filteredColumns.toDate).toEqual(1400000000001);
        });

        it('should pivot a dimension into columns', function () {
            var header = [
                    'pivot-by-this',
                    'this-column-disappears-in-aggregation',
                    'metric-to-aggregate',
                ],
                rowsByDate = {
                    '2018-05-01': [['A', 'A1', 1], ['A', 'A2', 2], ['B', 'B1', 4]],
                    '2018-05-02': [['B', 'B1', 40], ['A', 'A1', 10], ['C', 'C1', 50]],
                    '2018-05-03': [['C', 'C2', 500]],
                },
                ts = new TimeseriesData(header, rowsByDate);

            var pivotedTs = ts.pivot('pivot-by-this', 'metric-to-aggregate');

            expect(pivotedTs.header).toEqual(['A', 'B', 'C']);
            expect(pivotedTs.rowsByDate).toEqual({
                '2018-05-01': [[3, 4, 0]],
                '2018-05-02': [[10, 40, 50]],
                '2018-05-03': [[0, 0, 500]],
            });
            expect(pivotedTs.colorLabels).toEqual(['A', 'B', 'C']);
            expect(pivotedTs.patternLabels).toEqual(['pivot-by-this', 'pivot-by-this', 'pivot-by-this']);
        });
    });
});
