define(['config', 'wikimetricsApi', 'configApi', 'jquery'], function (siteConfig, wikimetrics, configApi, $) {

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

        it('should get metrics configuration', function () {
            configApi.getCategorizedMetrics();
            expect($.ajax.getCalls()[0].args[0].url).toBe(siteConfig.configApi.urlCategorizedMetrics);
        });
    });
});