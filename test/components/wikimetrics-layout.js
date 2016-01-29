'use strict';
define(function(require) {

    var component = require('components/metrics-by-project-layout/metrics-by-project-layout'),
        wikimetricsApi = require('apis.wikimetrics');

    var MetricsByProjectLayout = component.viewModel;

    describe('MetricsByProjectLayout view model', function() {

        beforeEach(function() {
            var deferred = new $.Deferred();
            deferred.resolveWith(null, ['not important']);
            sinon.stub($, 'ajax').returns(deferred);
            sinon.stub(wikimetricsApi, 'getProjectAndLanguageChoices');
        });
        afterEach(function () {
            $.ajax.restore();
            wikimetricsApi.getProjectAndLanguageChoices.restore();
        });

        it('should create observables needed by others', function() {
            var layout = new MetricsByProjectLayout();

            expect(typeof layout.selectedMetric).toEqual('function');
            expect(typeof layout.selectedProjects).toEqual('function');

            expect(typeof layout.metrics).toEqual('function');
            expect(typeof layout.defaultMetrics).toEqual('function');
        });
    });
});
