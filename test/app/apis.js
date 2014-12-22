define([
    'config', 'wikimetricsApi', 'configApi', 'annotationsApi', 'mediawiki-storage', 'jquery'
], function (siteConfig, wikimetrics, configApi, annotationsApi,  mediawikiStorage, $) {

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

        it('should get metric annotations', function (done) {
            var mediawikiHost = 'some.mediawiki.host',
                annotationsPage = 'SomeMediawikiPageName',
                startDate = '2014-01-01 00:00:00',
                endDate = '2014-01-01 00:00:00',
                note = 'Some text.';
                annotations = [{start: startDate, end: endDate, note: note}];

            sinon.stub(mediawikiStorage, 'get', function (options) {
                expect(options.host).toBe(mediawikiHost);
                expect(options.pageName).toBe(annotationsPage);

                var deferred = new $.Deferred();
                deferred.resolve(annotations);
                return deferred.promise();
            });

            var metric = {
                annotations: {
                    host: mediawikiHost,
                    pageName: annotationsPage
                }
            };
            annotationsApi.get(metric, function (returned) {
                expect(returned instanceof Array).toBe(true);
                expect(returned.length).toBe(1);
                expect(typeof returned[0]).toBe('object');
                expect(returned[0].start).toBe(startDate);
                expect(returned[0].end).toBe(endDate);
                expect(returned[0].note).toBe(note);
                mediawikiStorage.get.restore();
                done();
            });
        });

        it('should trigger error callback when annotation page is not a list', function (done) {
            var mediawikiHost = 'some.mediawiki.host',
                annotationsPage = 'SomeMediawikiPageName';

            sinon.stub(mediawikiStorage, 'get', function () {
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });

            var metric = {
                annotations: {
                    host: mediawikiHost,
                    pageName: annotationsPage
                }
            };
            annotationsApi.get(
                metric,
                function (result) {  // success callback
                    expect(true).toBe(false);  // should not get here
                },
                function (error) {  // error callback
                    expect(error instanceof TypeError).toBe(true);
                    mediawikiStorage.get.restore();
                    done();
                }
            );
        });

        it('should return empty list when metric has no annotations info', function (done) {
            sinon.stub(mediawikiStorage, 'get', function (options) {
                expect(true).toBe(false);  // should not get here
            });

            var metric = {};  // metric has no annotations information
            annotationsApi.get(metric, function (returned) {
                expect(returned instanceof Array).toBe(true);
                expect(returned.length).toBe(0);
                mediawikiStorage.get.restore();
                done();
            });
        });

        it('should filter out annotations with invalid dates', function (done) {
            sinon.stub(mediawikiStorage, 'get', function (options) {
                var deferred = new $.Deferred();
                deferred.resolve([
                    {start: 'Bad date', note: 'Some note.'},
                    {start: '2014-01-01 00:00:00', note: 'Some note.'}
                ]);
                return deferred.promise();
            });

            var metric = {
                annotations: {
                    host: 'some.mediawiki.host',
                    pageName: 'SomeMediawikiPageName'
                }
            };
            annotationsApi.get(metric, function (returned) {
                expect(returned instanceof Array).toBe(true);
                expect(returned.length).toBe(1);
                mediawikiStorage.get.restore();
                done();
            });
        });

        it('should filter out annotations with no note', function (done) {
            sinon.stub(mediawikiStorage, 'get', function (options) {
                var deferred = new $.Deferred();
                deferred.resolve([
                    {start: '2014-01-01 00:00:00'},
                    {start: '2014-01-01 00:00:00', note: 'Some note.'}
                ]);
                return deferred.promise();
            });

            var metric = {
                annotations: {
                    host: 'some.mediawiki.host',
                    pageName: 'SomeMediawikiPageName'
                }
            };
            annotationsApi.get(metric, function (returned) {
                expect(returned instanceof Array).toBe(true);
                expect(returned.length).toBe(1);
                mediawikiStorage.get.restore();
                done();
            });
        });

        it('should filter out annotations with bad time interval', function (done) {
            sinon.stub(mediawikiStorage, 'get', function (options) {
                var deferred = new $.Deferred();
                deferred.resolve([
                    // end date before start date
                    {start: '2014-01-01', end: '2013-01-01', note: 'Some note.'},
                    {start: '2014-01-01', end: '2014-01-02', note: 'Some note.'}
                ]);
                return deferred.promise();
            });

            var metric = {
                annotations: {
                    host: 'some.mediawiki.host',
                    pageName: 'SomeMediawikiPageName'
                }
            };
            annotationsApi.get(metric, function (returned) {
                expect(returned instanceof Array).toBe(true);
                expect(returned.length).toBe(1);
                mediawikiStorage.get.restore();
                done();
            });
        });
    });
});
