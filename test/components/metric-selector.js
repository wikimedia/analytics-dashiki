define(['components/metric-selector/metric-selector', 'knockout'], function(component, ko) {
    var MetricSelector = component.viewModel;

    describe('MetricSelector view model', function() {

        it('should add two binding handlers to knockout', function() {
            expect(ko.bindingHandlers.metricName).not.toBe(undefined);
        });

        it('should process params', function() {
            var metricsConfig = [
                {name: 'Something', metrics: ['a','b']},
                {name: 'Else', metrics: ['c']}
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
            expect(instance.categories()[0].metrics).toEqual(['a','b','c']);
            // don't clobber what's passed in
            expect(metricsConfig[0].name).not.toBe('All metrics');

            // defaultSelection can be set
            params.defaultSelection = ['b'];
            instance = new MetricSelector(params);
            expect(instance.addedMetrics()).toEqual(['b']);

            // defaultSelection can be observable, and the instance reacts to changes
            params.defaultSelection = ko.observable();
            instance = new MetricSelector(params);
            params.defaultSelection(['b']);
            expect(instance.addedMetrics()).toEqual(['b']);

            // metrics can be observable
            params.metrics = ko.observableArray(metricsConfig);
            instance = new MetricSelector(params);
            expect(instance.categories()[0].metrics).toEqual(['a','b','c']);

            // **** internal methods
            // adding a metric
            instance.addMetric('c');
            expect(instance.addedMetrics()).toEqual(['b','c']);
            expect(instance.selectedMetric()).toEqual('b');

            // removing an un-selected metric
            instance.removeMetric('c');
            expect(instance.selectedMetric()).toEqual('b');

            // removing the selected metric selects the next one
            instance.addMetric('c');
            instance.removeMetric('b');
            expect(instance.selectedMetric()).toEqual('c');

            // removing all metrics clears selectedMetric
            instance.removeMetric('c');
            expect(instance.selectedMetric()).toBeNull();

            // adding a metric selects it
            instance.addMetric('c');
            expect(instance.selectedMetric()).toEqual('c');

            // categories work properly
            instance = new MetricSelector(params);
            expect(instance.selectedCategory().name).toEqual('All metrics');
            instance.selectCategory(metricsConfig[1]);
            expect(instance.selectedCategory().name).toEqual('Else');
        });
    });
});
