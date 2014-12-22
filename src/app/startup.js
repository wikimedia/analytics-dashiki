/**
All requires below live on global scope.
There is no need to specify them as such
**/
define(['knockout', 'jquery', 'ajaxWrapper', 'logger', './global-bindings'], function(ko) {

    'use strict';

    // register components here like
    ko.components.register('wikimetrics-layout', { require: 'components/wikimetrics-layout/wikimetrics-layout' });
    ko.components.register('wikimetrics-visualizer', { require: 'components/wikimetrics-visualizer/wikimetrics-visualizer' });
    ko.components.register('project-selector', { require: 'components/project-selector/project-selector' });
    ko.components.register('metric-selector', { require: 'components/metric-selector/metric-selector' });
    ko.components.register('time-selector', { require: 'components/time-selector/time-selector' });
    ko.components.register('breakdown-toggle', { require: 'components/breakdown-toggle/breakdown-toggle' });
    ko.components.register('vega-timeseries', { require: 'components/visualizers/vega-timeseries/vega-timeseries' });
    ko.components.register('annotation-list', { require: 'components/annotation-list/annotation-list' });

    // Start the application
    ko.applyBindings();
});
