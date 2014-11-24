define(['components/breakdown-toggle/breakdown-toggle', 'knockout'], function(component, ko) {
    var BreakdownToggle = component.viewModel;

    describe('BreakdownToggle view model', function() {

        it('should have a toggle function', function() {
            var params = {
                metric: ko.observable({
                    showBreakdown: ko.observable(false)
                })
            };
            var instance = new BreakdownToggle(params);

            expect(typeof(instance.toggle)).toBe('function');

            instance.toggle();
            expect(instance.metric().showBreakdown()).toBe(true);
        });
    });
});
