define(function (require) {
    'use strict';

    var wikimetrics = require('apis.wikimetrics'),
        aqsApi = require('apis.aqs'),
        configApi = require('apis.config'),
        annotationsApi = require('apis.annotations'),
        datasetsApi = require('apis.datasets'),
        mediawikiStorage = require('mediawiki-storage'),
        config = require('config'),
        sitematrix = require('sitematrix'),
        $ = require('jquery');

    describe('Wikimetrics API', function () {
        var converter;

        beforeEach(function () {
            sinon.stub($, 'ajax');
            converter = wikimetrics.dataConverter;
            wikimetrics.dataConverter = function () {
                return;
            };
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

        it('should return empty TimeseriesData', function (done) {
            var deferred = new $.Deferred();
            deferred.reject(new Error('SomeError'));
            $.ajax.returns(deferred);

            var metric = {
                name: 'metric'
            };
            wikimetrics.getData(metric, 'project').done(function (data) {
                expect(data.header).toEqual([]);
                done();
            });
        });

    });

    describe('AQS', function () {
        var xhr, requests,
            sitematrixData = {
                'sitematrix': {
                    'count': 894,
                    '0': {
                        'code': 'aa',
                        'name': 'some',
                        'site': [{
                            'url': 'https: //aa.wikipedia.org',
                            'dbname': 'aawiki',
                            'code': 'wiki',
                            'sitename': 'Wikipedia',
                            'closed': ''
                        }, {
                            'url': 'https://aa.wiktionary.org',
                            'dbname': 'aawiktionary',
                            'code': 'wiktionary',
                            'sitename': 'Wiktionary',
                            'closed': ''
                        }],
                        'localname': 'Afar'
                    }
                }
            };

        // mocking native object as pageviews.js bower module
        // does not use jquery
        beforeEach(function () {
            xhr = sinon.useFakeXMLHttpRequest();
            requests = [];
            xhr.onCreate = function (req) {
                requests.push(req);
            };
        });

        afterEach(function () {
            $.ajax.restore();
            xhr.restore();
        });

        it('should fetch the correct project on AQS URL if project exist', function () {
            var deferred = new $.Deferred();

            deferred.resolveWith(null, [sitematrixData]);

            // mocking ajax cause sitematrix does use jquery for ajax
            sinon.stub($, 'ajax').returns(deferred);

            var metric = {
                name: 'Pageviews'
            };

            aqsApi.getData(metric, 'aawiktionary');

            //given that ajax is a fake it shoudld resolve imediately
            expect(requests[0].url.match(/aa.wiktionary/).toString()).toBe(['aa.wiktionary'].toString());

            // should also match all-access
            expect(requests[0].url.match(/all-access/).toString()).toBe(['all-access'].toString());
        });

        it('Should request pageviews for mobile and desktop data breakdowns', function () {
            var deferred = new $.Deferred();

            deferred.resolveWith(null, [sitematrixData]);

            // mocking ajax cause sitematrix does use jquery for ajax
            sinon.stub($, 'ajax').returns(deferred);

            var metric = {
                name: 'Pageviews'
            };

            // request breakdowns
            aqsApi.getData(metric, 'aawiktionary', ['All', 'Desktop site', 'Mobile site']);

            // request for mobile and desktop data
            expect(/all-access/.test(requests[0].url)).toBe(true, 'all-access fetched');
            expect(/desktop/.test(requests[1].url)).toBe(true, 'desktop fetched');
            expect(/mobile-web/.test(requests[2].url)).toBe(true, 'mobile-web fetched');
        });

        it('Should request unique devices for mobile and desktop data breakdowns', function () {
            var deferred = new $.Deferred();

            deferred.resolveWith(null, [sitematrixData]);

            // mocking ajax cause sitematrix does use jquery for ajax
            sinon.stub($, 'ajax').returns(deferred);

            var metric = {
                name: 'UniqueDevices'
            };

            // request breakdowns
            aqsApi.getData(metric, 'aawiktionary', ['All', 'Desktop site', 'Mobile site']);

            // request for mobile and desktop data
            expect(/all-sites/.test(requests[0].url)).toBe(true, 'all-sites fetched');
            expect(/desktop-site/.test(requests[1].url)).toBe(true, 'desktop-site fetched');
            expect(/mobile-site/.test(requests[2].url)).toBe(true, 'mobile-site fetched');
        });

        it('Should request correct date format depending on granularity', function () {
            var deferred = new $.Deferred();

            deferred.resolveWith(null, [sitematrixData]);

            // mocking ajax cause sitematrix does use jquery for ajax
            sinon.stub($, 'ajax').returns(deferred);

            // hourly granularity
            var metric = {name: 'Pageviews', granularity: 'hourly'};
            aqsApi.getData(metric, 'aawiktionary', ['All']);
            expect(/[0-9]{10}\/[0-9]{10}/.test(requests[0].url)).toBe(true);

            // daily granularity
            var metric = {name: 'Pageviews', granularity: 'daily'};
            aqsApi.getData(metric, 'aawiktionary', ['All']);
            expect(/[0-9]{8}00\/[0-9]{8}00/.test(requests[1].url)).toBe(true);

            // monthly granularity
            var metric = {name: 'UniqueDevices', granularity: 'monthly'};
            aqsApi.getData(metric, 'aawiktionary', ['All']);
            expect(/[0-9]{6}01\/[0-9]{6}01/.test(requests[2].url)).toBe(true);
        });

        it('should return empty TimeseriesData if getting data fails', function (done) {
            var deferred = new $.Deferred();
            deferred.reject(new Error('SomeError'));
            sinon.stub($, 'ajax').returns(deferred);

            var metric = {
                name: 'metric',
                breakdown: {}
            };

            aqsApi.getData(metric, 'project').done(function (data) {
                expect(data.header).toEqual([]);
                done();
            });
        });
    });

    //mmm.. not api per se but close to how config works
    describe('Sitematrix', function () {

        afterEach(function () {
            $.ajax.restore();
        });

        it('sitematrix should raise an error if project does not exist', function () {
            var deferred = new $.Deferred();

            deferred.resolveWith(null, []);

            // mocking ajax cause sitematrix does use jquery for ajax
            sinon.stub($, 'ajax').returns(deferred);

            var p = sitematrix.getProjectUrl(config, 'badbadproject');

            p.then(function () {
                // promise should not be sucessful
                expect(true).toEqual(false);

            }, function () {
                // promise should be rejected if project is no good
                expect(true).toEqual(true);

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
                annotations = [{
                    start: startDate,
                    end: endDate,
                    note: note
                }];

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
                function () { // success callback
                    expect(true).toBe(false); // should not get here
                },
                function (error) { // error callback
                    expect(error instanceof TypeError).toBe(true);
                    done();
                }
            );
        });

        it('should return empty list when metric has no annotations info', function (done) {
            sinon.stub(mediawikiStorage, 'get', function () {
                expect(true).toBe(false); // should not get here
            });

            var metric = {}; // metric has no annotations information
            annotationsApi.get(metric, function (returned) {
                expect(returned instanceof Array).toBe(true);
                expect(returned.length).toBe(0);
                done();
            });
        });

        it('should filter out annotations with invalid dates', function (done) {
            sinon.stub(mediawikiStorage, 'get', function () {
                var deferred = new $.Deferred();
                deferred.resolve([{
                    start: 'Bad date',
                    note: 'Some note.'
                }, {
                    start: '2014-01-01 00:00:00',
                    note: 'Some note.'
                }]);
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
                deferred.resolve([{
                    start: '2014-01-01 00:00:00'
                }, {
                    start: '2014-01-01 00:00:00',
                    note: 'Some note.'
                }]);
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
                    {
                        start: '2014-01-01',
                        end: '2013-01-01',
                        note: 'Some note.'
                    }, {
                        start: '2014-01-01',
                        end: '2014-01-02',
                        note: 'Some note.'
                    }
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
            var metricInfo = {
                'metric': 'metric',
                'submetric': 'submetric'
            };
            datasetsApi.getData(metricInfo, 'project');
            expect($.ajax.getCalls()[0].args[0].url).toBe(expected);
        });

        it('should fetch the correct URL when using metric.path', function () {
            var deferred = new $.Deferred();
            deferred.resolveWith(null, ['not important']);
            sinon.stub($, 'ajax').returns(deferred);

            datasetsApi.root = 'something';
            var expected = 'something/metric/submetric/project.tsv';
            var metricInfo = {
                'path': 'metric/submetric/project.tsv',
            };
            datasetsApi.getData(metricInfo, 'project');
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