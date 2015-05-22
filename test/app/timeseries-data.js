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
            }).toThrow();

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

            t1.rowsByDate[dates[1]] = [10];
            t1.rowsByDate[dates[2]] = [20];
            t1.rowsByDate[dates[3]] = [30];
            t1.rowsByDate[dates[5]] = [50];

            t2.rowsByDate[dates[2]] = [20, 20];
            t2.rowsByDate[dates[4]] = [40, 40];
            t2.rowsByDate[dates[5]] = [50, 50];
            t2.rowsByDate[dates[6]] = [60, 60];

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
    });
});
