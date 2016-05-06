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

    describe('hierarchy-data converter', function () {
        var converterCSV = factory.getDataConverter('csv'),
            buildHierarchy = factory.getDataConverter('hierarchy');

        it('should convert tsv to hierarchy', function () {
            var csvData = (
                    'h1,h2,h3,h4\n' +
                    '2016-01-01,catA1,catB1,1\n' +
                    '2016-01-02,catA2,catB2,2\n' +
                    '2016-01-03,catA2,catB3,3\n'
                ),
                converted = converterCSV({}, csvData),
                hierarchy = buildHierarchy(
                    converted.rowData(),
                    function (row) { return row.slice(1, row.length - 1); }
                ),
                expected = {
                    name: 'root',
                    children: [
                        {
                            name: 'catA2',
                            children: [
                                {name: 'catB3', size: 3},
                                {name: 'catB2', size: 2}
                            ]
                        },
                        {
                            name: 'catA1',
                            children: [
                                {name: 'catB1', size: 1}
                            ]
                        }
                    ]
                },
                checkTrees = function (a, b) {
                    if (a.name !== b.name || a.size !== b.size ||
                        Boolean(a.children) !== Boolean(b.children) ||
                        a.children && a.children.length !== b.children.length) {
                        return false;
                    }
                    if (a.children) {
                        a.children.forEach(function (aChild, index) {
                            var bChild = a.children[index];
                            if (!checkTrees(aChild, bChild)) {
                                return false;
                            }
                        });
                    }
                    return true;
                };

            expect(checkTrees(hierarchy, expected)).toBe(true);
        });
    });

    describe('aqs-api response converter', function () {

        it('happy case ', function () {

            var converterAQSApi = factory.getDataConverter(
                'aqs-api-response', 'views');

            var sample = {
                'items': [{
                    'project': 'en.wikipedia',
                    'access': 'mobile_web',
                    'agent': 'user',
                    'granularity ': 'daily',
                    'timestamp': '2015080100',
                    'views': 104621367
                }, {
                    'project': 'en.wikipedia',
                    'access': 'mobile_web',
                    'agent ': 'user',
                    'granularity ': 'daily',
                    'timestamp': '2015080200',
                    'views': 113144834
                }]
            };

            var opt = {
                label: 'blahLabel',
                varyColors: false,
                varyPatterns: true,
                globalPattern: false,
                startDate: '2014-01-01'
            };


            //TimeseriesData{header: ['blah'], colorLabels: ['blah'], patternLabels: [0], rowsByDate: Object{2015-08-01: [...], 2015-08-02: [...]}, duplicateDates: undefined}
            var converted = converterAQSApi(opt, sample);

            //there should be 2 records
            expect(converted.rowsByDate['2015-08-01'][0]).toEqual([104621367]);
            expect(converted.rowsByDate['2015-08-02'][0]).toEqual([113144834]);
            expect(converted.header).toEqual(['blahLabel']);
        });
    });
});
