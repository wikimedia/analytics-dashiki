define(['wikimetricsApi', 'jquery'], function (wikimetrics, $) {

    describe('Wikimetrics API', function() {
        var getJSONConfigStub;

        beforeEach(function() {
            var deferred = new $.Deferred();
            deferred.resolveWith('not important');
            sinon.stub($, 'get').returns(deferred);
            getJSONConfigStub = sinon.stub(wikimetrics, '_getJSONConfig');
        });
        afterEach(function () {
            $.get.restore();
            getJSONConfigStub.restore();
        });

        it('should fetch the correct URL', function () {
            wikimetrics.root = 'something';
            var expected = 'https://something/static/public/datafiles/metric/project.json';

            wikimetrics.get('metric', 'project');
            expect($.get.calledWith(expected)).toBe(true);
        });

        it('should not retrieve option file if project choices are already set ', function () {
            wikimetrics.root = 'something';
            var callback = sinon.stub();
            wikimetrics.getProjectAndLanguageChoices(callback);
            expect(getJSONConfigStub.called).toBe(true);

            wikimetrics.projectOptions = ['some option'];
            wikimetrics.languageOptions = ['some other option'];
            wikimetrics.getProjectAndLanguageChoices(callback);
            // ajax call was not done the second time
            expect(getJSONConfigStub.calledOnce).toBe(true);
        });

        it('should get metrics configuration', function() {
            wikimetrics.getCategorizedMetrics();
            expect($.get.calledWith(wikimetrics.categorizedMetricsUrl)).toBe(true);
        });
    });
});
