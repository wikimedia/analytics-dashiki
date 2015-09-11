define(function (require) {
    'use strict';

    var factory = require('dataConverterFactory');

    describe('sv converter', function () {
        var converterCSV = factory.getDataConverter('csv');
        var converterTSV = factory.getDataConverter('tsv');


        it('should convert comma separated', function () {
            var sample = 'h1,h2,h3\n2014-08-19,1,2\n2014-08-18,3,4';

            var options = {
                label: 'arwiki',
                allColumns: false,
            };
            var converted = converterCSV(options, sample);

            expect(converted.header).toEqual(['h2']);
            expect(converted.rowData()).toEqual([
                [new Date('2014-08-18').getTime(), 3],
                [new Date('2014-08-19').getTime(), 1],
            ]);
            expect(converted.colorLabels).toEqual(['arwiki']);
            expect(converted.patternLabels).toEqual(['arwiki']);
        });

        it('bad records do not break parser', function () {
            var sample = 'h1,h2,h3\ngarbage,1,2\n2014-08-18,3,4';

            var options = {
                label: 'arwiki',
                allColumns: false
            };
            var converted = converterCSV(options, sample);

            // there is only one record with a valid date
            expect(converted.header).toEqual(['h2']);
            expect(converted.rowData()).toEqual([
                [new Date('2014-08-18').getTime(), 3],
            ]);
            expect(converted.colorLabels).toEqual(['arwiki']);
            expect(converted.patternLabels).toEqual(['arwiki']);
        });

        it('should convert tab separated unix lines', function () {
            var sample = 'h1\th2\th3\r\ngarbage\t1\t2\r\n2014-08-18\t3\t4';

            var options = {
                label: 'arwiki',
                lineSeparator: '\r\n',
                allColumns: false,
            };

            var converted = converterTSV(options, sample);

            // there is only one record with a valid date
            expect(converted.header).toEqual(['h2']);
            expect(converted.rowData()).toEqual([
                [new Date('2014-08-18').getTime(), 3],
            ]);
            expect(converted.colorLabels).toEqual(['arwiki']);
            expect(converted.patternLabels).toEqual(['arwiki']);
        });

        it('should get all columns with allColumns: true', function () {
            var sample = 'h1,h2,h3\n2014-08-19,1,2\n2014-08-18,3,4';

            var options = {
                label: 'arwiki',
                allColumns: true,
            };
            var converted = converterCSV(options, sample);

            expect(converted.header).toEqual(['h2', 'h3']);
            expect(converted.rowData()).toEqual([
                [new Date('2014-08-18').getTime(), 3, 4],
                [new Date('2014-08-19').getTime(), 1, 2],
            ]);
            expect(converted.colorLabels).toEqual(['arwiki', 'arwiki']);
            expect(converted.patternLabels).toEqual(['arwiki', 'arwiki']);
        });

        it('should vary patterns and colors as directed', function () {
            var sample = 'h1,h2,h3\n2014-08-19,1,2\n2014-08-18,3,4';

            var options = {
                label: 'arwiki',
                allColumns: true,
                varyColors: true,
                varyPatterns: true,
            };
            var converted = converterCSV(options, sample);

            expect(converted.header).toEqual(['h2', 'h3']);
            expect(converted.rowData()).toEqual([
                [new Date('2014-08-18').getTime(), 3, 4],
                [new Date('2014-08-19').getTime(), 1, 2],
            ]);
            expect(converted.colorLabels).toEqual(['h2', 'h3']);
            expect(converted.patternLabels).toEqual(['h2', 'h3']);
        });

        it('should apply a globally consistent pattern when told', function () {
            var sample = 'h1,h2,h3\n2014-08-19,1,2\n2014-08-18,3,4';

            var options = {
                label: 'arwiki',
                allColumns: true,
                varyPatterns: false,
                globalPattern: true,
            };
            var converted = converterCSV(options, sample);

            expect(converted.header).toEqual(['h2', 'h3']);
            expect(converted.rowData()).toEqual([
                [new Date('2014-08-18').getTime(), 3, 4],
                [new Date('2014-08-19').getTime(), 1, 2],
            ]);
            expect(converted.colorLabels).toEqual(['arwiki', 'arwiki']);
            expect(converted.patternLabels).toEqual([0, 0]);
        });
    });


    describe('wikimetrics-timeseries converter', function () {
        var converterWikimetrics = factory.getDataConverter('json');
        // pass the configuration to the converter
        var options = {
            defaultSubmetrics: {
                'RollingActiveEditor': 'rolling_active_editor'
            }
        };

        // test new wikimetrics format
        var sample = {
            'result': {
                'Sum': {
                    'rolling_active_editor': {
                        '2014-08-19 00:00:00': 1120.0,
                        '2014-08-20 00:00:00': 1117.0,
                        '2014-08-21 00:00:00': 1120.0,
                        '2014-08-18 00:00:00': 1132.0
                    }
                }
            },
            'parameters': {
                'Cohort': 'arwiki',
                'Created On': '2014-08-19 00:00:00',
                'Metric_end_date': '2014-08-19 00:00:00',
                'Metric_start_date': '2014-08-18 00:00:00',
                'Cohort Size': 0,
                'Metric': 'RollingActiveEditor'
            }
        };

        it('should convert and get colors and patterns right', function () {
            var converted = converterWikimetrics(options, sample);

            expect(converted.header).toEqual(['arwiki']);
            expect(converted.rowData()).toEqual([
                [new Date('2014-08-18').getTime(), 1132.0],
                [new Date('2014-08-19').getTime(), 1120.0],
                [new Date('2014-08-20').getTime(), 1117.0],
                [new Date('2014-08-21').getTime(), 1120.0],
            ]);
            expect(converted.colorLabels).toEqual(['arwiki']);
            expect(converted.patternLabels).toEqual([0]);
        });
    });
});
