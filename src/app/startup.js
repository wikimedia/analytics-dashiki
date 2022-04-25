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

    // out-of-service component is common
    ko.components.register('out-of-service', {require: 'components/layouts/out-of-service/out-of-service'    });
    ko.components.register('created-by', {require: 'components/layouts/created-by/created-by'    });

    // separate layouts, NOTE: might be cleaner to have each layout register its own components

    // *********** BEGIN Metrics By Project Layout Components ********** //
    ko.components.register('metrics-by-project-layout', { require: 'components/layouts/metrics-by-project/metrics-by-project' });
    ko.components.register('wikimetrics',               { require: 'components/visualizers/wikimetrics/wikimetrics' });
    ko.components.register('worldmap',                  { require: 'components/visualizers/worldmap/worldmap' });
    ko.components.register('project-selector',          { require: 'components/selectors/project/project' });
    ko.components.register('metric-selector',           { require: 'components/selectors/metric/metric' });
    ko.components.register('breakdown-toggle',          { require: 'components/controls/breakdown-toggle/breakdown-toggle' });
    ko.components.register('annotation-list',           { require: 'components/visualizers/annotation-list/annotation-list' });
    // *********** END Metrics By Project Layout Components ************ //


    // *********** BEGIN Compare Layout Components ********** //
    ko.components.register('compare-layout',        { require: 'components/layouts/compare/compare' });
    ko.components.register('dropdown',              { require: 'components/controls/dropdown/dropdown' });
    ko.components.register('button-group',          { require: 'components/controls/button-group/button-group' });
    ko.components.register('sunburst',              { require: 'components/visualizers/sunburst/sunburst' });
    ko.components.register('hierarchy',             { require: 'components/visualizers/hierarchy/hierarchy' });
    ko.components.register('dygraphs-timeseries',   { require: 'components/visualizers/dygraphs-timeseries/dygraphs-timeseries' });
    ko.components.register('filter-timeseries',     { require: 'components/visualizers/filter-timeseries/filter-timeseries' });
    ko.components.register('stacked-bars',          { require: 'components/visualizers/stacked-bars/stacked-bars' });

    // comparison components
    ko.components.register('a-b-compare',           { require: 'components/visualizers/a-b-compare/a-b-compare' });
    ko.components.register('compare-sunburst',      { require: 'components/visualizers/a-b-compare/compare-sunburst' });
    ko.components.register('compare-timeseries',    { require: 'components/visualizers/a-b-compare/compare-timeseries' });
    ko.components.register('compare-stacked-bars',  { require: 'components/visualizers/a-b-compare/compare-stacked-bars' });
    // *********** END Compare Layout Components ************ //


    // *********** BEGIN Tabs Layout Components ********** //
    ko.components.register('tabs-layout',       { require: 'components/layouts/tabs/tabs' });
    ko.components.register('visualizer',        { require: 'components/visualizers/visualizer/visualizer' });
    ko.components.register('table-timeseries',  { require: 'components/visualizers/table-timeseries/table-timeseries' });
    // *********** END Tabs Layout Components ************ //

    // Setup knockout to globally defer updates
    ko.options.deferUpdates = true;

    // Start the application
    ko.applyBindings();
});
