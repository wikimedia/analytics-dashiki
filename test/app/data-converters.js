define(['app/data-converters/wikimetrics-timeseries', 'moment'], function(converter, moment) {

    describe('wikimetrics-timeseries converter', function() {
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

        it('should convert', function() {
            var converted = converter(sample);
            expect(converted[0].date).toEqual(moment('2014-08-18 00:00:00').toDate());
            expect(converted[0].label).toEqual('arwiki');
            expect(converted[1].value).toEqual(1120.0);

            converted = converter(sample2);
            expect(converted[0].date).toEqual(moment('2014-08-18 00:00:00').toDate());
            expect(converted[0].label).toEqual('arwiki');
            expect(converted[1].value).toEqual(1120.0);
        });
    });
});
