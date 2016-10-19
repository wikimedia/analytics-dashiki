'use strict';
(function () {
    // Reference your test modules here
    var testModules = [
        'components/layouts/metrics-by-project',
        'components/visualizers/wikimetrics',
        'components/visualizers/vega-timeseries',
        'components/selectors/project',
        'app/converters',
        'app/apis',
        'lib/state-manager'
    ];

    // After the 'jasmine-boot' module creates the Jasmine environment, load all test modules then run them
    require(['jasmine-boot'], function () {
        var modulesCorrectedPaths = testModules.map(function (m) {
            return '../test/' + m;
        });
        require(modulesCorrectedPaths, window.onload);
    });
}());
