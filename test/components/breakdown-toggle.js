define(['components/breakdown-toggle/breakdown-toggle', 'knockout'], function (component, ko) {
    var BreakdownToggle = component.viewModel;

    describe('BreakdownToggle view model', function () {

        it('should have a toggle function that changes display values', function () {
            ko.options.deferred = false;
            var params = {
                metric: ko.observable({
                    breakdown: {
                        columns: []
                    }
                }),
                breakdownColumns: ko.observableArray([]),
                patterns: []
            };
            var instance = new BreakdownToggle(params);

            expect(typeof (instance.toggle)).toBe('function');

            expect(instance.display()).toBe(false);
            instance.toggle();
            expect(instance.display()).toBe(true);

        });
    });
});