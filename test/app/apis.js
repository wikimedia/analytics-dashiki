'use strict';
/**
 * Please take a look at issues with jasmine test setup,
 * scope is not what you might think:
 * Memory leaks on jasmine: https://github.com/jasmine/jasmine/issues/941
 **/
define(function (require) {

    var $ = require('jquery'),
        config = require('config'),
        sinon = require('sinon');


    describe('Wikimetrics API', function () {
        var sandbox;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            this.wikimetrics = require('apis.wikimetrics');
            this.wikimetrics.dataConverter = function () {
                return;
            };
        });

        afterEach(function () {
            this.wikimetrics = null;
            sandbox.restore();
        });

        it('should fetch the correct URL', function () {
            var deferred = new $.Deferred();
            deferred.resolveWith(null, ['not important']);
            sandbox.stub($, 'ajax');
            $.ajax.returns(deferred);

            this.wikimetrics.root = 'something';
            var expected = 'https://something/static/public/datafiles/metric/project.json';
            var metric = {
                name: 'metric'
            };
            this.wikimetrics.getData(metric, 'project');
            expect($.ajax.getCalls()[0].args[0].url).toBe(expected);
        });

        it('should return empty TimeseriesData', function () {
            var deferred = new $.Deferred();
            deferred.reject(new Error('SomeError'));
            sandbox.stub($, 'ajax');
            $.ajax.returns(deferred);

            var metric = {
                name: 'metric'
            };
            this.wikimetrics.getData(metric, 'project').then(function (data) {
                // this is being resolved imediately,
                // no need to use done(), it doesn't work and
                // makes stack traces nonsensical when tests fail
                expect(data.header).toEqual([]);
            });
        });

    });



    describe('AQS', function () {
        var sandbox, sitematrixData = {
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

        // mocking native object as pageviews.js module
        // does not use jquery
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            this.aqsApi = require('apis.aqs');
            this.sitematrix = require('sitematrix');

            this.xhr = sinon.useFakeXMLHttpRequest();
            this.requests = [];

            //* sinon and phantomjs do not coperate to mock xhr
            // https://github.com/sinonjs/sinon/issues/228
            var self = this;
            this.xhr.onCreate = function (req) {
                self.requests.push(req);
            };

            sandbox.stub(this.sitematrix, 'getProjectUrl', function (options) {
                var deferred = new $.Deferred();
                deferred.resolve('aa.wiktionary.org');
                return deferred.promise();
            });

        });

        afterEach(function () {
            this.aqsApi = null;
            sinon.restore();
            sandbox.restore();

        });

        it('should fetch the correct project on AQS URL if project exist', function () {

            var metric = {
                name: 'Pageviews'
            };

            this.aqsApi.getData(metric, 'aawiktionary');

            //given that ajax is a fake it shoudld resolve imediately
            expect(this.requests[0].url.match(/aa.wiktionary/).toString()).toBe(['aa.wiktionary'].toString());

            // should also match all-access
            expect(this.requests[0].url.match(/all-access/).toString()).toBe(['all-access'].toString());
        });

        it('Should request pageviews for mobile and desktop data breakdowns', function () {
            var deferred = new $.Deferred();

            deferred.resolveWith(null, [sitematrixData]);

            // mocking ajax cause sitematrix does use jquery for ajax
            sandbox.stub($, 'ajax').returns(deferred);

            var metric = {
                name: 'Pageviews'
            };

            // request breakdowns
            this.aqsApi.getData(metric, 'aawiktionary', ['All', 'Desktop site', 'Mobile site']);

            // request for mobile and desktop data
            expect(/all-access/.test(this.requests[0].url)).toBe(true, 'all-access fetched');
            expect(/desktop/.test(this.requests[1].url)).toBe(true, 'desktop fetched');
            expect(/mobile-web/.test(this.requests[2].url)).toBe(true, 'mobile-web fetched');
        });

        it('Should request unique devices for mobile and desktop data breakdowns', function () {
            var deferred = new $.Deferred();

            deferred.resolveWith(null, [sitematrixData]);

            // mocking ajax cause sitematrix does use jquery for ajax
            sandbox.stub($, 'ajax').returns(deferred);

            var metric = {
                name: 'UniqueDevices'
            };

            // request breakdowns
            this.aqsApi.getData(metric, 'aawiktionary', ['All', 'Desktop site', 'Mobile site']);

            // request for mobile and desktop data
            expect(/all-sites/.test(this.requests[0].url)).toBe(true, 'all-sites fetched');
            expect(/desktop-site/.test(this.requests[1].url)).toBe(true, 'desktop-site fetched');
            expect(/mobile-site/.test(this.requests[2].url)).toBe(true, 'mobile-site fetched');
        });

        it('Should request correct date format depending on granularity', function () {
            var deferred = new $.Deferred();

            deferred.resolveWith(null, [sitematrixData]);

            // mocking ajax cause sitematrix does use jquery for ajax
            sandbox.stub($, 'ajax').returns(deferred);

            // hourly granularity
            var metric = { name: 'Pageviews', granularity: 'hourly' };

            this.aqsApi.getData(metric, 'aawiktionary', ['All']);
            expect(/[0-9]{10}\/[0-9]{10}/.test(this.requests[0].url)).toBe(true);

            // daily granularity
            metric = { name: 'Pageviews', granularity: 'daily' };
            this.aqsApi.getData(metric, 'aawiktionary', ['All']);
            expect(/[0-9]{8}00\/[0-9]{8}00/.test(this.requests[1].url)).toBe(true);

            // monthly granularity
            metric = { name: 'UniqueDevices', granularity: 'monthly' };

            this.aqsApi.getData(metric, 'aawiktionary', ['All']);
            expect(/[0-9]{6}01\/[0-9]{6}01/.test(this.requests[2].url)).toBe(true);
        });

        it('should return empty TimeseriesData if getting data fails', function () {
            var deferred = new $.Deferred();
            deferred.reject(new Error('SomeError'));
            sandbox.stub($, 'ajax').returns(deferred);

            var metric = {
                name: 'metric',
                breakdown: {}
            };

            this.aqsApi.getData(metric, 'project').done(function (data) {
                expect(data.header).toEqual([]);
            });
        });
    });

    //mmm.. not api per se but close to how config works
    describe('Sitematrix', function () {

        var sandbox;

        beforeEach(function () {
            this.sitematrix = require('sitematrix');
            sandbox = sinon.sandbox.create();
        });


        afterEach(function () {
            sandbox.restore();
        });

        it('sitematrix should raise an error if project does not exist', function () {
            sandbox.stub(this.sitematrix, 'getProjectUrl', function (options) {
                var deferred = new $.Deferred();
                deferred.reject(new Error('SomeError'));
                return deferred.promise();
            });

            var p = this.sitematrix.getProjectUrl(config, 'badbadproject');

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
        var sandbox;

        beforeEach(function () {
            this.configApi = require('apis.config');
            this.mediawikiStorage = require('mediawiki-storage');
            this.saveConfig = this.configApi.config;
            sandbox = sinon.sandbox.create();

            this.configApi.config = {
                endpoint: 'test',
                dashboardPage: 'dash',
                defaultDashboardPageRoot: 'defaultDash',
                categorizedMetricsPage: 'metrics',
            };
            sandbox.stub(this.mediawikiStorage, 'get').returns(new $.Deferred());
        });

        afterEach(function () {
            this.configApi.config = this.saveConfig;
            sandbox.restore();
        });

        it('should get metrics configuration', function () {
            this.configApi.getCategorizedMetrics();

            expect(this.mediawikiStorage.get.calledWith({
                host: this.configApi.config.endpoint,
                pageName: this.configApi.config.categorizedMetricsPage,
            })).toBeTruthy();
        });

        it('should get dashboard configuration', function () {
            this.configApi.getDefaultDashboard();
        });

    });

    describe('Annotations API', function () {

        var sandbox;

        beforeEach(function () {
            this.annotationsApi = require('apis.annotations');
            this.mediawikiStorage = require('mediawiki-storage');
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('should get metric annotations', function () {
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

            sandbox.stub(this.mediawikiStorage, 'get', function (options) {
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
            this.annotationsApi.get(metric, function (returned) {
                expect(returned instanceof Array).toBe(true);
                expect(returned.length).toBe(1);
                expect(typeof returned[0]).toBe('object');
                expect(returned[0].start).toBe(startDate);
                expect(returned[0].end).toBe(endDate);
                expect(returned[0].note).toBe(note);
            });
        });

        it('should trigger error callback when annotation page is not a list', function () {
            var mediawikiHost = 'some.mediawiki.host',
                annotationsPage = 'SomeMediawikiPageName';

            sandbox.stub(this.mediawikiStorage, 'get', function () {
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
            this.annotationsApi.get(
                metric,
                function () { // success callback
                    expect(true).toBe(false); // should not get here
                },
                function (error) { // error callback
                    expect(error instanceof TypeError).toBe(true);
                }
            );
        });

        it('should return empty list when metric has no annotations info', function () {
            sandbox.stub(this.mediawikiStorage, 'get', function () {
                expect(true).toBe(false); // should not get here
            });

            var metric = {}; // metric has no annotations information
            this.annotationsApi.get(metric, function (returned) {
                expect(returned instanceof Array).toBe(true);
                expect(returned.length).toBe(0);
            });
        });

        it('should filter out annotations with invalid dates', function () {
            sandbox.stub(this.mediawikiStorage, 'get', function () {
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
            this.annotationsApi.get(metric, function (returned) {
                expect(returned instanceof Array).toBe(true);
                expect(returned.length).toBe(1);
            });
        });

        it('should filter out annotations with no note', function () {
            sandbox.stub(this.mediawikiStorage, 'get', function () {
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
            this.annotationsApi.get(metric, function (returned) {
                expect(returned instanceof Array).toBe(true);
                expect(returned.length).toBe(1);
            });
        });

        it('should filter out annotations with bad time interval', function () {

            sandbox.stub(this.mediawikiStorage, 'get', function () {
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
            this.annotationsApi.get(metric, function (returned) {
                expect(returned instanceof Array).toBe(true);
                expect(returned.length).toBe(1);
            });
        });
    });

    describe('Datasets API', function () {

        var sandbox;

        beforeEach(function () {
            this.datasetsApi = require('apis.datasets');
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('should fetch the correct URL', function () {
            var deferred = new $.Deferred();
            deferred.resolveWith(null, ['not important']);
            sandbox.stub($, 'ajax').returns(deferred);

            this.datasetsApi.root = 'something';
            var expected = 'something/metric/submetric/project.tsv';
            var metricInfo = {
                'metric': 'metric',
                'submetric': 'submetric'
            };
            this.datasetsApi.getData(metricInfo, 'project');
            expect($.ajax.getCalls()[0].args[0].url).toBe(expected);
        });

        it('should fetch the correct URL when using metric.path', function () {
            var deferred = new $.Deferred();
            deferred.resolveWith(null, ['not important']);
            sandbox.stub($, 'ajax').returns(deferred);

            this.datasetsApi.root = 'something';
            var expected = 'something/metric/submetric/project.tsv';
            var metricInfo = {
                'path': 'metric/submetric/project.tsv',
            };
            this.datasetsApi.getData(metricInfo, 'project');
            expect($.ajax.getCalls()[0].args[0].url).toBe(expected);
        });

        it('should return empty list if getting data fails', function () {
            var deferred = new $.Deferred();
            deferred.reject(new Error('SomeError'));
            sandbox.stub($, 'ajax').returns(deferred);

            var metric = {
                name: 'metric',
                breakdown: {}
            };
            this.datasetsApi.getData(metric, 'project').done(function (data) {
                expect(data.rowData()).toEqual([]);
            });

        });

    });
});
