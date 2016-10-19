'use strict';
define(function(require) {
    var component = require('components/selectors/metric/metric'),
        ko = require('knockout');

    var MetricSelector = component.viewModel;

    describe('MetricSelector view model', function() {

        it('should add two binding handlers to knockout', function() {
            expect(ko.bindingHandlers.metricName).not.toBe(undefined);
        });

        it('should process params', function() {
            var metricA = {name: 'a', submetric: 'a_1'},
                metricB = {name: 'b', submetric: 'b_1'},
                metricC = {name: 'c', submetric: 'c_1', displayName: 'display'},
                metricsConfig = [
                    {name: 'Something', metrics: [metricA, metricB]},
                    {name: 'Else', metrics: [metricC]},
                ];
            var params = {
                metrics: metricsConfig,
                selectedMetric: ko.observable()
            };

            // **** initialization
            // defaultSelection can be unset
            var instance = new MetricSelector(params);
            expect(instance.selectedMetric).toBe(params.selectedMetric);
            expect(instance.selectedMetric()).toBeNull();
            expect(instance.categories()[0].name).toBe('All metrics');
            expect(instance.categories()[0].metrics).toEqual([metricA, metricB, metricC]);
            // don't clobber what's passed in
            expect(metricsConfig[0].name).not.toBe('All metrics');

            // addedMetrics can be set
            params.defaultSelection = ['b'];
            instance = new MetricSelector(params);
            expect(instance.addedMetrics()).toEqual([metricB]);

            // both name or displayName can be used to set metrics
            params.defaultSelection = ['display'];
            instance = new MetricSelector(params);
            expect(instance.addedMetrics()).toEqual([metricC]);

            // defaultSelection can be observable, and the instance reacts to changes
            params.defaultSelection = ko.observable();
            instance = new MetricSelector(params);
            params.defaultSelection(['b']);
            expect(instance.addedMetrics()).toEqual([metricB]);

            // changing the defaults with delay still selects a metric
            expect(instance.selectedMetric()).toEqual(metricB);

            // metrics can be observable
            params.metrics = ko.observableArray(metricsConfig);
            instance = new MetricSelector(params);
            expect(instance.categories()[0].metrics).toEqual([metricA, metricB, metricC]);

            // **** internal methods
            // adding a metric
            instance.addMetric(metricC);
            expect(instance.addedMetrics()).toEqual([metricB, metricC]);
            expect(instance.selectedMetric()).toEqual(metricC);

            // removing an un-selected metric
            instance.removeMetric(metricC);
            expect(instance.selectedMetric()).toEqual(metricB);

            // removing the selected metric selects the next one
            instance.addMetric(metricC);
            instance.removeMetric(metricB);
            expect(instance.selectedMetric()).toEqual(metricC);

            // removing all metrics clears selectedMetric
            instance.removeMetric(metricC);
            expect(instance.selectedMetric()).toBeNull();

            // adding a metric selects it
            instance.addMetric(metricC);
            expect(instance.selectedMetric()).toEqual(metricC);
        });
    });
});
