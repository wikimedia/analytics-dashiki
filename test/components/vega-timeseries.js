define(['components/visualizers/vega-timeseries/vega-timeseries', 'knockout'], function(component, ko) {
    var VegaTimeseries = component.viewModel;

    describe('VegaTimeseries view model', function() {

        it('should add a binding handler to knockout', function() {
            expect(ko.bindingHandlers.vegaTime).not.toBe(undefined);
        });

        it('should copy params', function() {
            var params = {
                data: ko.observable('something'),
                options: {width: 100}
            };
            var instance = new VegaTimeseries(params);
            expect(instance.data).toBe(params.data);
            expect(instance.options.width).toBe(params.options.width);
        });
    });
});
