define(['knockout'], function(ko) {

    'use strict';

    // register components here like
    ko.components.register('wikimetrics-layout', { require: 'components/wikimetrics-layout/wikimetrics-layout' });
    ko.components.register('project-selector', { require: 'components/project-selector/project-selector' });
    ko.components.register('metric-selector', { require: 'components/metric-selector/metric-selector' });
    ko.components.register('time-selector', { require: 'components/time-selector/time-selector' });
    ko.components.register('selection-visualizer', { require: 'components/selection-visualizer/selection-visualizer' });

    // Start the application
    ko.applyBindings();
});
