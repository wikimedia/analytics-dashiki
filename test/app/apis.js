define([
    'config', 'wikimetricsApi', 'configApi', 'mediawiki-storage', 'jquery'
], function (siteConfig, wikimetrics, configApi, mediawikiStorage, $) {

    describe('Wikimetrics API', function () {

        beforeEach(function () {
            var deferred = new $.Deferred();
            deferred.resolveWith(null, ['not important']);
            sinon.stub($, 'ajax').returns(deferred);


        });
        afterEach(function () {
            $.ajax.restore();
        });

        it('should fetch the correct URL', function () {
            sinon.stub(wikimetrics, 'getDataConverter').returns(function () {});
            wikimetrics.root = 'something';
            var expected = 'https://something/static/public/datafiles/metric/project.json';
            var metric = {
                name: 'metric'
            };
            wikimetrics.getData(metric, 'project');
            expect($.ajax.getCalls()[0].args[0].url).toBe(expected);
        });

        it('should not retrieve option file if project choices are already set ', function () {
            var getJSONStub = sinon.stub(wikimetrics, '_getJSON')
                .returns(new $.Deferred());

            wikimetrics.root = 'something';
            var callback = sinon.stub();
            wikimetrics.getProjectAndLanguageChoices(callback);
            expect(getJSONStub.called).toBe(true);

            wikimetrics.projectOptions = ['some option'];
            wikimetrics.languageOptions = ['some other option'];
            wikimetrics.getProjectAndLanguageChoices(callback);
            // ajax call was not done the second time
            expect(getJSONStub.calledOnce).toBe(true);

            getJSONStub.restore();
        });

        it('should get metrics configuration', function (done) {
            var config = siteConfig.configApi;
            var result = {'metrics': 'configuration'};

            var deferred = new $.Deferred();
            deferred.resolve(result);

            sinon.stub(mediawikiStorage, 'get', function (options) {
                expect(options.host).toBe(config.endpoint);
                expect(options.pageName).toBe(config.categorizedMetricsPage);
                return deferred.promise();
            });

            configApi.getCategorizedMetrics(function (returned) {
                expect(returned).toBe(result);
                mediawikiStorage.get.restore();
                done();
            });
        });

        it('should get dashboard configuration', function (done) {
            var config = siteConfig.configApi;
            var result = {'dashboard': 'configuration'};

            var deferred = new $.Deferred();
            deferred.resolve(result);

            sinon.stub(mediawikiStorage, 'get', function (options) {
                expect(options.host).toBe(config.endpoint);
                expect(options.pageName).toBe(config.defaultDashboardPage);
                return deferred.promise();
            });

            configApi.getDefaultDashboard(function (returned) {
                expect(returned).toBe(result);
                mediawikiStorage.get.restore();
                done();
            });
        });
    });
});
