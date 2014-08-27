define(['app/apis/wikimetrics', 'jquery'], function(wikimetrics, $) {

    describe('Wikimetrics API', function() {
        beforeEach(function() {
            sinon.stub($, 'get');
        });
        afterEach(function() {
            $.get.restore();
        });

        it('should fetch the correct URL', function() {
            wikimetrics.root = 'something';
            var expected = 'https://something/static/public/datafiles/metric/project.json';

            wikimetrics.get('metric', 'project');
            expect($.get.calledWith(expected)).toBe(true);
        });
    });
});
