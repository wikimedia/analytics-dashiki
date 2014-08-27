define(function (require){
    var component   = require('components/wikimetrics-visualizer/wikimetrics-visualizer'),
        $           = require('jquery'),
        api         = require('app/apis/wikimetrics'),
        ko          = require('knockout');

    var WikimetricsVisualizer = component.viewModel,
        selectedMetric,
        selectedProjects,
        visualizer,
        cohort = 'cohort',
        v1 = 12,
        v2 = 1,
        metric = 'RollingActiveEditor',
        response = {
            'result': {
                'Sum': {
                    'rolling_active_editor': {
                        '2014-08-19 00:00:00': v2,
                        '2014-08-18 00:00:00': v1
                    }
                }
            },
            'parameters': {
                'Cohort': cohort,
                'Metric': metric
            }
        },
        deferred = $.Deferred();


    describe('WikimetricsVisualizer view model', function() {

        beforeEach(function() {
            // make api.get return a mock promise, which can be resolved
            // differently in each test
            sinon.stub(api, 'get').returns(deferred.promise());
            selectedMetric = ko.observable();
            selectedProjects = ko.observableArray();
            visualizer = new WikimetricsVisualizer({
                metric: selectedMetric,
                projects: selectedProjects
            });
            deferred.resolveWith(this, [response]);
        });

        afterEach(function() {
            api.get.restore();
        });

        it('should not do anything without a selected metric', function() {

            selectedProjects(['one', 'two']);
            // while datasets are going to be created
            expect(visualizer.datasets().length).toEqual(2);
            // they won't fetch any data, as shown by the merged data being empty:
            expect(visualizer.mergedData().length).toEqual(0);

            // but after a metric is set
            selectedMetric('RollingActiveEditor');
            // the datasets will stay in place
            expect(visualizer.datasets().length).toEqual(2);
            // and their internal .data observable will be filled by the api
            // and result in merged data being available (2 records x 2 datasets = 4):
            expect(visualizer.mergedData().length).toEqual(4);
        });

        it('should transform selected projects and metrics into merged data', function() {

            selectedMetric(metric);
            selectedProjects.push(cohort);

            expect(visualizer.mergedData().length).toEqual(2);
            // save a reference to the first dataset to make sure it's not being re-created
            // later - it shouldn't be because we're using knockout-projectsions' map:
            var firstDataset = visualizer.datasets()[0];

            // change projects observable and make sure the merged data reflects it
            var anotherCohort = 'another-cohort';
            response.parameters.Cohort = anotherCohort;
            selectedProjects.push(anotherCohort);

            // this data is here from the first push (cohort)
            expect(visualizer.mergedData()[0].date).toEqual(new Date('2014-08-18 00:00:00'));
            expect(visualizer.mergedData()[0].label).toEqual(cohort);
            expect(visualizer.mergedData()[0].value).toEqual(v1);
            expect(visualizer.mergedData()[1].date).toEqual(new Date('2014-08-19 00:00:00'));
            expect(visualizer.mergedData()[1].label).toEqual(cohort);
            expect(visualizer.mergedData()[1].value).toEqual(v2);

            // this data is here from the second push (another-cohort)
            expect(visualizer.mergedData()[2].date).toEqual(new Date('2014-08-18 00:00:00'));
            expect(visualizer.mergedData()[2].label).toEqual(anotherCohort);
            expect(visualizer.mergedData()[2].value).toEqual(v1);
            expect(visualizer.mergedData()[3].date).toEqual(new Date('2014-08-19 00:00:00'));
            expect(visualizer.mergedData()[3].label).toEqual(anotherCohort);
            expect(visualizer.mergedData()[3].value).toEqual(v2);

            // test that the first dataset saved above was not re-created
            // by the second push.  Note the use of toBe instead of toEqual:
            expect(firstDataset).toBe(visualizer.datasets()[0]);
        });
    });
});
