define(function (require) {
    'use strict';

    var TimeseriesData = require('converters.timeseries'),
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
            var t1 = new TimeseriesData([1, 2, 3]),
                t2 = new TimeseriesData([4, 5]),
                tt = t1.merge(t2);

            expect(tt.header).toEqual([1, 2, 3, 4, 5]);
            expect(tt.colorLabels).toEqual([1, 2, 3, 4, 5]);
            expect(tt.patternLabels).toEqual([1, 2, 3, 4, 5]);
        });

        it('should merge filters correctly', function () {
            var t1 = new TimeseriesData(['filter left']),
                t2 = new TimeseriesData(['filter right']);

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
            var t1 = new TimeseriesData([1, 2]),
                t2 = new TimeseriesData([1, 2]);

            expect(t1.merge(t2).rowData()).toEqual([]);
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
            var t1 = new TimeseriesData([1, 2, 3]),
                t2 = new TimeseriesData([4, 5]),
                t3 = new TimeseriesData([5, 6]),
                tt = t1.merge([t2, t3]);

            expect(tt.header).toEqual([1, 2, 3, 4, 5, 5, 6]);
            expect(tt.colorLabels).toEqual([1, 2, 3, 4, 5, 5, 6]);
            expect(tt.patternLabels).toEqual([1, 2, 3, 4, 5, 5, 6]);
        });

        it('should respect options to rowData', function () {
            var date = new Date('2015-01-01').getTime(),
                t1 = new TimeseriesData(
                    [1],
                    {'2015-01-01': [[1]]}
                );

            expect(t1.rowData({convertToDate: true})[0][0].getTime()).toEqual(date);
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
            var t1 = new TimeseriesData(),
                t2 = new TimeseriesData([], {}, [], [], true);

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
    });
});
