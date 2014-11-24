define(function (require) {

    var moment = require('moment'),
        factory = require('dataConverterFactory');

    describe('sv converter', function () {
        var converterCSV = factory.getDataConverter('csv');
        var converterTSV = factory.getDataConverter('tsv');



        var sample = 'h1,h2,h3\n2014-08-19,1,2\n2014-08-18,3,4';

        it('should convert comma separated', function () {

            var options = {
                label: 'arwiki',
                columnToUse: 'h3'
            };
            var converted = converterCSV(options, sample);

            expect(converted[0].date).toEqual(moment('2014-08-18 00:00:00').toDate().getTime());
            expect(converted[0].label).toEqual('arwiki');
            expect(converted[1].value).toEqual(2);
        });


        it('bad records do not break parser', function () {

            var sample = 'h1,h2,h3\ngarbage,1,2\n2014-08-18,3,4';

            var options = {
                label: 'arwiki',
                columnToUse: 'h3'
            };
            var converted = converterCSV(options, sample);
            // there is only 1 good record
            expect(converted.length).toEqual(1);

            expect(converted[0].date).toEqual(moment('2014-08-18 00:00:00').toDate().getTime());
            expect(converted[0].label).toEqual('arwiki');
            expect(converted[0].value).toEqual(4);
        });

        it('should convert tab separated unix lines', function () {
            sample = sample.replace(/,/g, '\t').replace(/\n/g, '\r\n');

            var options = {
                label: 'arwiki',
                columnToUse: 'h3',
                lineSeparator: '\r\n'
            };


            var converted = converterTSV(options, sample);
            expect(converted[0].date).toEqual(moment('2014-08-18 00:00:00').toDate().getTime());
            expect(converted[0].label).toEqual('arwiki');
            expect(converted[1].value).toEqual(2);
        });
    });

    describe('wikimetrics-timeseries wikimetricsConverter', function () {
        var converterWikimetrics = factory.getDataConverter('json');
        // pass the configuration to the wikimetricsConverter
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
        // and old wikimetrics format.  NOTE: remove this when we phase that format out
        var sample2 = {
            '2014-08-19 00:00:00': {
                'Sum': {
                    'rolling_active_editor': 1120.0
                }
            },
            '2014-08-18 00:00:00': {
                'Sum': {
                    'rolling_active_editor': 1132.0
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

        it('should convert', function () {
            var converted = converterWikimetrics(options, sample);

            expect(converted[0].date).toEqual(moment('2014-08-18 00:00:00').toDate().getTime());
            expect(converted[0].label).toEqual('arwiki');
            expect(converted[1].value).toEqual(1120.0);

            converted = converterWikimetrics(options, sample);
            expect(converted[0].date).toEqual(moment('2014-08-18 00:00:00').toDate().getTime());
            expect(converted[0].label).toEqual('arwiki');
            expect(converted[1].value).toEqual(1120.0);
        });
    });
});
