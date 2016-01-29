define(function (require) {
    'use strict';

    var component = require('components/visualizers/wikimetrics/wikimetrics'),
        $ = require('jquery'),
        api = require('apis.wikimetrics'),
        ko = require('knockout'),
        TimeseriesData = require('converters.timeseries');

    var WikimetricsVisualizer = component.viewModel,
        selectedMetric,
        selectedProjects,
        visualizer,
        cohort = 'cohort',
        anotherCohort = 'another-cohort',
        cohortOption = {
            code: cohort
        },
        anotherCohortOption = {
            code: anotherCohort
        },
        v1 = 12,
        v2 = 1,
        metric = {
            name: 'RollingActiveEditor',
            submetric: 'rolling_active_editor'
        },

        deferred = new $.Deferred(),

        transformedResponse = new TimeseriesData(
            [cohort],
            {
                '2014-08-22': [[v1]],
                '2014-08-23': [[v2]]
            }
        );


    describe('WikimetricsVisualizer view model', function () {

        beforeEach(function () {
            // make api.get return a mock promise, which can be resolved
            // differently in each test
            sinon.stub(api, 'getData').returns(deferred.promise());
            selectedMetric = ko.observable();
            selectedProjects = ko.observableArray();

            visualizer = new WikimetricsVisualizer({
                metric: selectedMetric,
                projects: selectedProjects,
            });
            deferred.resolveWith(this, [transformedResponse]);

            // just stub the apply colors function to get it out of the way
            sinon.stub(visualizer, 'applyColors');
        });

        afterEach(function () {
            api.getData.restore();
            visualizer.applyColors.restore();
        });

        it('should not do anything without a selected metric', function () {

            selectedProjects(['one', 'two']);
            // nothing is fetched without a metric
            expect(visualizer.mergedData().header.length).toEqual(0);
            expect(visualizer.mergedData().rowData().length).toEqual(0);

            // but after a metric is set
            selectedMetric(metric);
            // promises will result in merged data being available (2 records x 2 datasets = 4):
            expect(visualizer.mergedData().rowData()).toEqual([
                [1408665600000, v1, v1],
                [1408752000000, v2, v2],
            ]);
        });

        it('should transform selected projects and metrics into merged data', function () {

            selectedMetric({
                name: 'RollingActiveEditor',
                submetric: 'rolling_active_editor'
            });
            selectedProjects.push(cohortOption);
            expect(visualizer.mergedData().header).toEqual([cohort]);
            expect(visualizer.mergedData().rowData()).toEqual([
                [1408665600000, v1],
                [1408752000000, v2],
            ]);

            // change projects observable and make sure the merged data reflects it
            transformedResponse.header = [anotherCohort];
            selectedProjects.push(anotherCohortOption);

            // this data is here from the second push (another-cohort)
            expect(visualizer.mergedData().header).toEqual([anotherCohort, anotherCohort]);
            expect(visualizer.mergedData().rowData()).toEqual([
                [1408665600000, v1, v1],
                [1408752000000, v2, v2],
            ]);
        });
    });
});
