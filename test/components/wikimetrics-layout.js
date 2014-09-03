define(['components/wikimetrics-layout/wikimetrics-layout'], function(component) {
    var WikimetricsLayout = component.viewModel;

    describe('WikimetricsLayout view model', function() {

        beforeEach(function() {
            var deferred = new $.Deferred();
            deferred.resolveWith(null, ['not important']);
            sinon.stub($, 'ajax').returns(deferred);
        });
        afterEach(function () {
            $.ajax.restore();
        });

        it('should create observables needed by others', function() {
            var layout = new WikimetricsLayout();

            expect(typeof(layout.selectedMetric)).toEqual('function');
            expect(typeof(layout.selectedProjects)).toEqual('function');

            expect(typeof(layout.metrics)).toEqual('function');
            expect(typeof(layout.defaultMetrics)).toEqual('function');
        });
    });
});
