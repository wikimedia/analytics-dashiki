'use strict';
/**
 * Defines a generic tabular layout dashboard
 */
define(function (require) {

    var ko = require('knockout'),
        _ = require('lodash'),
        templateMarkup = require('text!./tabs.html'),
        configApi = require('apis.config'),
        annotationsApi = require('apis.annotations');

    require('twix');

    function isGraph(g) {
        return g && g.id && g.title;
    }

    var visualizers = {
        'sunburst'              : { defaultDays: 35, icon: 'pie' },
        'stacked-bars'          : { defaultDays: 35, icon: 'bar' },
        'dygraphs-timeseries'   : { defaultDays: 'all', icon: 'line' },
        'table-timeseries'      : { defaultDays: 'all', icon: 'table' },
    };
    // these two graphs work the same
    visualizers.hierarchy = visualizers.sunburst;

    function TabsLayout() {

        this.config = ko.observable({});
        this.selectedTab = ko.observable({});
        this.selectedGraph = ko.observable(null);

        this.select = function (tab, graph) {
            location.hash = tab.id;
            if (isGraph(graph) && !graph.selected()) {
                location.hash += '/' + graph.id;
                this.selectedGraph(graph);
                // TODO: hack - take this out into a binding
                $('.scrollable').scrollTop(0);
            } else {
                this.selectedGraph(null);
            }
            this.selectedTab(tab);
        }.bind(this);

        configApi.getDefaultDashboard(function (config) {
            config.tabs.forEach(function (t) {
                var dashboard = this;

                t.id = _.kebabCase(t.title);
                t.select = dashboard.select;
                t.selected = ko.computed(function () {
                    return t === dashboard.selectedTab();
                });

                t.graphs.forEach(function (g) {
                    g.id = _.kebabCase(g.title);
                    g.select = function (thisGraph, event) {
                        event.stopPropagation();
                        dashboard.select(t, g);
                    };
                    g.selected = ko.computed(function () {
                        return g === dashboard.selectedGraph();
                    });

                    g.showLastDays = g.showLastDays || visualizers[g.type].defaultDays;

                    if (t.dataRange) {
                        g.startDate = g.startDate || t.dataRange.startDate;
                    }
                    g.typeIcon = visualizers[g.type].icon;

                    // Fetch annotations if present
                    var annotationsInfo = g.annotations;
                    g.annotations = ko.observable();
                    if (annotationsInfo) {
                        annotationsApi.getTimeseriesData(
                            {annotations: annotationsInfo}
                        ).then(g.annotations);
                    }
                });

            }, this);

            if (config.tabs.length > 0) {
                var tabId = config.tabs[0].id,
                    graphId, tab, graph;

                if (location.hash) {
                    var selectIds = location.hash.substr(1).split('/');
                    tabId = selectIds[0];
                    graphId = selectIds[1];
                }
                tab = _.find(config.tabs, function (t) {
                    return t.id === tabId;
                });
                if (graphId) {
                    graph = _.find(tab.graphs, function (g) {
                        return g.id === graphId;
                    });
                }
                this.select(tab, graph);
            }
            this.config(config);

        }.bind(this), 'tabs');
    }

    return {
        viewModel: TabsLayout,
        template: templateMarkup,
        dispose: function () {
            return;
        }
    };
});
