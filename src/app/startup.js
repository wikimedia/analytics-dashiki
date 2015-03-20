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


    // *********** BEGIN Funnel Layout Components ********** //
    // separate layout, TODO: make multiple layouts coexist
    ko.components.register('funnel-layout', { require: 'components/funnel-layout/funnel-layout' });
    ko.components.register('dropdown', { require: 'components/dropdown/dropdown' });
    ko.components.register('button-group', { require: 'components/button-group/button-group' });
    ko.components.register('sunburst', { require: 'components/visualizers/sunburst/sunburst' });
    ko.components.register('rickshaw-timeseries', { require: 'components/visualizers/rickshaw-timeseries/rickshaw-timeseries' });
    ko.components.register('nvd3-timeseries', { require: 'components/visualizers/nvd3-timeseries/nvd3-timeseries' });
    ko.components.register('dygraphs-timeseries', { require: 'components/visualizers/dygraphs-timeseries/dygraphs-timeseries' });
    //ko.components.register('stacked-bar', { require: 'components/visualizers/stacked-bar' });

    // comparison components
    ko.components.register('a-b-compare', { require: 'components/a-b-compare/a-b-compare' });
    ko.components.register('compare-sunburst', { require: 'components/a-b-compare/compare-sunburst' });
    ko.components.register('compare-timeseries', { require: 'components/a-b-compare/compare-timeseries' });

    // *********** END Funnel Layout Components ************ //

    // Start the application
    ko.applyBindings();
});
