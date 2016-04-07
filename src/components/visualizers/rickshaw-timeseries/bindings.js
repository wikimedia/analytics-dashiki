'use strict';
define(function(require) {

    var Rickshaw = require('rickshaw'),
        ko = require('knockout'),
        d3 = require('d3'),
        getBounds = require('utils.elements').getBounds;

    require('lib/polyfills');

    ko.bindingHandlers.rickshawTime = {
        init: function (element, valueAccessor) {
            var val = ko.unwrap(valueAccessor());

            var graphEl = d3.select(element).select(val.graphSelect).node(),
                legendEl = d3.select(element).select(val.legendSelect).node(),
                timelineEl = d3.select(element).select(val.timelineSelect).node(),
                zoomSliderEl = d3.select(element).select(val.zoomSliderSelect).node(),

                opt = val.options || {},

                bounds = getBounds(element, '.resizable.container');

            graphEl.graph = new Rickshaw.Graph({
                element: graphEl,
                width: opt.width || bounds.width * (opt.widthRatio || 13 / 16),
                height: opt.height || bounds.height * (opt.heightRatio || 5 / 6),
                renderer: 'multi',
                series: [],
            });

            graphEl.xAxis = new Rickshaw.Graph.Axis.Time({ graph: graphEl.graph });
            graphEl.yAxis = new Rickshaw.Graph.Axis.Y({
                graph: graphEl.graph,
                orientation: 'right',
                tickFormat: Rickshaw.Fixtures.Number.formatKMBT
            });

            graphEl.legend = new Rickshaw.Graph.Legend({
                graph: graphEl.graph,
                element: legendEl
            });

            graphEl.annotator = new Rickshaw.Graph.Annotate({
                graph: graphEl.graph,
                element: timelineEl
            });

            graphEl.zoomSlider = new Rickshaw.Graph.RangeSlider.Preview({
                graph: graphEl.graph,
                element: zoomSliderEl
            });

            graphEl.graph.render();
        },
        update: function (element, valueAccessor) {
            var val = ko.unwrap(valueAccessor()),
                graphEl = d3.select(element).select(val.graphSelect).node(),
                graph = graphEl.graph,
                legend = graphEl.legend;

            // reset the graph
            graph.series.length = 0;
            ko.unwrap(val.series).forEach(function (serie) {
                // transform x to seconds
                serie.data.forEach(function (point) {
                    point.x = point.x.getTime() / 1000;
                });
                var existing = graph.series.find(function (existingSerie) {
                    return existingSerie.name === serie.name;
                });
                if (!existing) {
                    graph.series.push(serie);
                } else {
                    existing.data.length = 0;
                    existing.data.push.apply(existing.data, serie.data);
                }
            });

            graph.validateSeries(graph.series);
            graph.update();
            legend.render();

            // some extended behavior needs to be re-created
            graphEl.hoverDetail = new Rickshaw.Graph.HoverDetail({
                graph: graph
            });

            graphEl.shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
                graph: graph,
                legend: legend
            });

            /* NOTE the Rickshaw Highlighter below messes up the scale:
            graphEl.highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
                graph: graph,
                legend: legend
            });
            */
        }
    };
});
