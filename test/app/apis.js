define(['wikimetricsApi', 'jquery'], function (wikimetrics, $) {

    describe('Wikimetrics API', function () {
        beforeEach(function () {
            sinon.stub($, 'get');
        });
        afterEach(function () {
            $.get.restore();
        });

        it('should fetch the correct URL', function () {
            wikimetrics.root = 'something';
            var expected = 'https://something/static/public/datafiles/metric/project.json';

            wikimetrics.get('metric', 'project');
            expect($.get.calledWith(expected)).toBe(true);
        });

        it('should not retrieve option file if project choices are already set ', function () {
            wikimetrics.root = 'something';
            var stub = sinon.stub(wikimetrics, '_getJSONConfig')
            var callback = sinon.stub();
            wikimetrics.getProjectAndLanguageChoices(callback);
            expect(stub.called).toBe(true);

            wikimetrics.projectOptions = ['some option'];
            wikimetrics.languageOptions = ['some other option'];
            wikimetrics.getProjectAndLanguageChoices(callback);
            // ajax call was not done the second time
            expect(stub.calledOnce).toBe(true);
        });

    });
});
