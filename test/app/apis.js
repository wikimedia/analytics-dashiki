define(function (require) {
    'use strict';

    var wikimetrics = require('apis.wikimetrics'),
        pageviewApi = require('apis.pageview'),
        configApi = require('apis.config'),
        annotationsApi = require('apis.annotations'),
        datasetsApi = require('apis.datasets'),
        mediawikiStorage = require('mediawiki-storage'),
        $ = require('jquery');

    describe('Wikimetrics API', function () {
        var converter;

        beforeEach(function () {
            sinon.stub($, 'ajax');
            converter = wikimetrics.dataConverter;
            wikimetrics.dataConverter = function () { return; };
        });

        afterEach(function () {
            $.ajax.restore();
            wikimetrics.dataConverter = converter;
        });

        it('should fetch the correct URL', function () {
            var deferred = new $.Deferred();
            deferred.resolveWith(null, ['not important']);
            $.ajax.returns(deferred);

            wikimetrics.root = 'something';
            var expected = 'https://something/static/public/datafiles/metric/project.json';
            var metric = {
                name: 'metric'
            };
            wikimetrics.getData(metric, 'project');
            expect($.ajax.getCalls()[0].args[0].url).toBe(expected);
        });

        it('should return empty list if getting data fails', function (done) {
            var deferred = new $.Deferred();
            deferred.reject(new Error('SomeError'));
            $.ajax.returns(deferred);

            var metric = {name: 'metric'};
            wikimetrics.getData(metric, 'project').done(function (data) {
                expect(data).toEqual([]);
                done();
            });
        });

    });

    describe('Pageview API', function () {

        afterEach(function () {
            $.ajax.restore();
        });

        it('should fetch the correct URL', function () {
            var deferred = new $.Deferred();
            deferred.resolveWith(null, ['not important']);
            sinon.stub($, 'ajax').returns(deferred);
            sinon.stub(pageviewApi, 'getDataConverter').returns(function () { return; });

            pageviewApi.root = 'something';
            var expected = 'https://something/static/public/datafiles/DailyPageviews/project.csv';
            var metric = {
                name: 'metric',
                breakdown: {}
            };
            pageviewApi.getData(metric, 'project');
            expect($.ajax.getCalls()[0].args[0].url).toBe(expected);

            pageviewApi.getDataConverter.restore();
        });

        it('should return empty list if getting data fails', function (done) {
            var deferred = new $.Deferred();
            deferred.reject(new Error('SomeError'));
            sinon.stub($, 'ajax').returns(deferred);

            var metric = {
                name: 'metric',
                breakdown: {}
            };
            pageviewApi.getData(metric, 'project').done(function (data) {
                expect(data).toEqual([]);
                done();
            });
        });

    });

    describe('Config API', function () {
        var saveConfig = configApi.config;

        beforeEach(function () {
            configApi.config = {
                endpoint: 'test',
                dashboardPage: 'dash',
                defaultDashboardPageRoot: 'defaultDash',
                categorizedMetricsPage: 'metrics',
            };
            sinon.stub(mediawikiStorage, 'get').returns(new $.Deferred());
        });

        afterEach(function () {
            configApi.config = saveConfig;
            mediawikiStorage.get.restore();
        });

        it('should get metrics configuration', function () {
            configApi.getCategorizedMetrics();
            expect(mediawikiStorage.get.calledWith({
                host: configApi.config.endpoint,
                pageName: configApi.config.categorizedMetricsPage,
            })).toBeTruthy();
        });

        it('should get dashboard configuration', function () {
            configApi.getDefaultDashboard();
        });

    });

    describe('Annotations API', function () {

        afterEach(function () {
            mediawikiStorage.get.restore();
        });

        it('should get metric annotations', function (done) {
            var mediawikiHost = 'some.mediawiki.host',
                annotationsPage = 'SomeMediawikiPageName',
                startDate = '2014-01-01 00:00:00',
                endDate = '2014-01-01 00:00:00',
                note = 'Some text.',
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
                function () {  // success callback
                    expect(true).toBe(false);  // should not get here
                },
                function (error) {  // error callback
                    expect(error instanceof TypeError).toBe(true);
                    done();
                }
            );
        });

        it('should return empty list when metric has no annotations info', function (done) {
            sinon.stub(mediawikiStorage, 'get', function () {
                expect(true).toBe(false);  // should not get here
            });

            var metric = {};  // metric has no annotations information
            annotationsApi.get(metric, function (returned) {
                expect(returned instanceof Array).toBe(true);
                expect(returned.length).toBe(0);
                done();
            });
        });

        it('should filter out annotations with invalid dates', function (done) {
            sinon.stub(mediawikiStorage, 'get', function () {
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
                done();
            });
        });

        it('should filter out annotations with no note', function (done) {
            sinon.stub(mediawikiStorage, 'get', function () {
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
                done();
            });
        });

        it('should filter out annotations with bad time interval', function (done) {
            sinon.stub(mediawikiStorage, 'get', function () {
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
                done();
            });
        });
    });

    describe('Datasets API', function () {

        afterEach(function () {
            $.ajax.restore();
        });

        it('should fetch the correct URL', function () {
            var deferred = new $.Deferred();
            deferred.resolveWith(null, ['not important']);
            sinon.stub($, 'ajax').returns(deferred);

            datasetsApi.root = 'something';
            var expected = 'something/metric/submetric/project.tsv';
            datasetsApi.getData('metric', 'submetric', 'project');
            expect($.ajax.getCalls()[0].args[0].url).toBe(expected);
        });

        it('should return empty list if getting data fails', function (done) {
            var deferred = new $.Deferred();
            deferred.reject(new Error('SomeError'));
            sinon.stub($, 'ajax').returns(deferred);

            var metric = {
                name: 'metric',
                breakdown: {}
            };
            datasetsApi.getData(metric, 'project').done(function (data) {
                expect(data.rowData()).toEqual([]);
                done();
            });
        });

    });
});
