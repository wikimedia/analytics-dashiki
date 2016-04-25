'use strict';
/**
All requires below live on global scope.
There is no need to specify them as such
**/
define(function(require) {

    var ko = require('knockout');

    require('jquery');
    require('ajaxWrapper');
    require('logger');
    require('app/ko-extensions/global-bindings');
    
    // out-of-service component is common
    ko.components.register('out-of-service', {require: 'components/out-of-service/out-of-service'    });

    // separate layouts, TODO: make each layout register its own components

    // *********** BEGIN Metrics By Project Layout Components ********** //
    ko.components.register('metrics-by-project-layout', { require: 'components/metrics-by-project-layout/metrics-by-project-layout' });
    ko.components.register('wikimetrics', { require: 'components/visualizers/wikimetrics/wikimetrics' });
    ko.components.register('project-selector', { require: 'components/project-selector/project-selector' });
    ko.components.register('metric-selector', { require: 'components/metric-selector/metric-selector' });
    ko.components.register('breakdown-toggle', { require: 'components/breakdown-toggle/breakdown-toggle' });
    ko.components.register('vega-timeseries', { require: 'components/visualizers/vega-timeseries/vega-timeseries' });
    ko.components.register('annotation-list', { require: 'components/annotation-list/annotation-list' });
    // *********** END Metrics By Project Layout Components ************ //


    // *********** BEGIN Compare Layout Components ********** //
    ko.components.register('compare-layout', { require: 'components/compare-layout/compare-layout' });
    ko.components.register('dropdown', { require: 'components/dropdown/dropdown' });
    ko.components.register('button-group', { require: 'components/button-group/button-group' });
    ko.components.register('sunburst', { require: 'components/visualizers/sunburst/sunburst' });
    ko.components.register('hierarchy', { require: 'components/visualizers/hierarchy/hierarchy' });
    ko.components.register('rickshaw-timeseries', { require: 'components/visualizers/rickshaw-timeseries/rickshaw-timeseries' });
    ko.components.register('nvd3-timeseries', { require: 'components/visualizers/nvd3-timeseries/nvd3-timeseries' });
    ko.components.register('dygraphs-timeseries', { require: 'components/visualizers/dygraphs-timeseries/dygraphs-timeseries' });
    ko.components.register('filter-timeseries', { require: 'components/visualizers/filter-timeseries/filter-timeseries' });
    ko.components.register('stacked-bars', { require: 'components/visualizers/stacked-bars/stacked-bars' });


    // comparison components
    ko.components.register('a-b-compare', { require: 'components/a-b-compare/a-b-compare' });
    ko.components.register('compare-sunburst', { require: 'components/a-b-compare/compare-sunburst' });
    ko.components.register('compare-timeseries', { require: 'components/a-b-compare/compare-timeseries' });
    ko.components.register('compare-stacked-bars', { require: 'components/a-b-compare/compare-stacked-bars' });
    // *********** END Compare Layout Components ************ //

    // *********** BEGIN Tabs Layout Components ********** //
    ko.components.register('tabs-layout', { require: 'components/tabs-layout/tabs-layout' });
    ko.components.register('visualizer', { require: 'components/visualizers/visualizer/visualizer' });
    ko.components.register('table-timeseries', { require: 'components/visualizers/table-timeseries/table-timeseries' });
    // *********** END Tabs Layout Components ************ //

    // Start the application
    ko.applyBindings();
});
