define(['components/breakdown-toggle/breakdown-toggle', 'knockout'], function (component, ko) {
    var BreakdownToggle = component.viewModel;

    describe('BreakdownToggle view model', function () {

        it('should have a toggle function that changes display values', function () {
            var params = {
                metric: ko.observable({
                    breakdown: {
                        columns: []
                    }
                }),
                breakdownState: ko.observable(),
                patterns: []
            };
            var instance = new BreakdownToggle(params);

            expect(typeof (instance.toggle)).toBe('function');


            expect(params.breakdownState().display()).toBe(false);
            instance.toggle();
            expect(params.breakdownState().display()).toBe(true);

        });
    });
});