'use strict';
define(function (require) {
    var component = require('components/visualizers/annotation-list/annotation-list'),
        annotationsApi = require('apis.annotations');

    var AnnotationList = component.viewModel;

    describe('AnnotationList view model', function () {

        var mediawikiHost = 'some.mediawiki.host',
            annotationsPage = 'SomeMediawikiPageName',
            params = {
                metric: {
                    annotations: {
                        host: mediawikiHost,
                        pageName: annotationsPage
                    }
                }
            };

        it('should pass the metric parameter to annotations api', function (done) {
            sinon.stub(annotationsApi, 'get', function (metric) {
                expect(metric instanceof Object).toBe(true);
                expect(metric.annotations instanceof Object).toBe(true);
                expect(metric.annotations.host).toBe(mediawikiHost);
                expect(metric.annotations.pageName).toBe(annotationsPage);
                annotationsApi.get.restore();
                done();
            });

            var instance = new AnnotationList(params);
            expect(instance instanceof Object).toBe(true);
        });

        it('should render annotations returned by annotations api', function () {
            sinon.stub(annotationsApi, 'get', function (metric, success) {
                success([
                    {start: '2014-01-01', end: '2014-01-02', note: 'Some note.'},
                    {start: '2014-05-01', end: '2014-06-02', note: 'Some other note.'},
                    {start: '2014-09-01', end: '2014-12-02', note: 'Yet another note.'}
                ]);
            });

            var instance = new AnnotationList(params);
            expect(instance.annotations() instanceof Array).toBe(true);
            expect(instance.annotations().length).toBe(3);
            annotationsApi.get.restore();
        });

        it('should create a date range description for each annotation', function() {
            sinon.stub(annotationsApi, 'get', function (metric, success) {
                success([
                    {start: '2013-01-01', end: '2013-01-02', note: 'Some note.'}
                ]);
            });

            var instance = new AnnotationList(params);
            expect(instance.annotations()[0].dateRange).toBe('Jan 1 - 2, 2013');
            annotationsApi.get.restore();
        });

        it('should create an html note for each description', function() {
            sinon.stub(annotationsApi, 'get', function (metric, success) {
                success([
                    {start: '2013-01-01', end: '2013-01-02', note: 'Some note.'}
                ]);
            });

            var instance = new AnnotationList(params);
            expect(instance.annotations()[0].htmlNote).toBe('<p>Some note.</p>\n');
            annotationsApi.get.restore();
        });

        it('should be protected against js injection', function() {
            var note = '<script>alert("this should not be executed");</script>',
                escapedNote = (
                    '<p>&lt;script&gt;alert(&quot;this should not be ' +
                    'executed&quot;);&lt;/script&gt;</p>\n'
                );

            sinon.stub(annotationsApi, 'get', function (metric, success) {
                success([{note: note}]);
            });

            var instance = new AnnotationList(params);
            expect(instance.annotations()[0].htmlNote).toBe(escapedNote);
            annotationsApi.get.restore();
        });

        it('should sort the annotations by start date', function() {
            var note1 = 'Should go first.',
                note2 = 'Should go second.',
                note3 = 'Should go third.';

            sinon.stub(annotationsApi, 'get', function (metric, success) {
                success([
                    {start: '2014-05-01', note: note3},
                    {start: '2014-01-01', note: note1},
                    {start: '2014-03-01', note: note2}
                ]);
            });

            var instance = new AnnotationList(params),
                formatted = function (note) {
                    return '<p>' + note + '</p>\n';
                };
            expect(instance.annotations()[0].htmlNote).toBe(formatted(note1));
            expect(instance.annotations()[1].htmlNote).toBe(formatted(note2));
            expect(instance.annotations()[2].htmlNote).toBe(formatted(note3));
            annotationsApi.get.restore();
        });
    });
});
