'use strict';
define(function(require) {
    var component = require('components/layouts/tabs/tabs'),
        configApi = require('apis.config'),
        sinon = require('sinon');

    var TabsLayout = component.viewModel;

    describe('TabsLayout view model', function() {

        beforeEach(function() {
            var deferred = new $.Deferred();
            deferred.resolveWith(null, ['not important']);
            sinon.stub($, 'ajax').returns(deferred);
            sinon.stub(configApi, 'getDefaultDashboard');
        });
        afterEach(function () {
            $.ajax.restore();
            configApi.getDefaultDashboard.restore();
        });

        it('should create observables needed by others', function() {
            var layout = new TabsLayout();

            expect(typeof layout.config).toEqual('function');
            expect(typeof layout.selectedTab).toEqual('function');
            expect(typeof layout.selectedGraph).toEqual('function');
        });
    });
});
