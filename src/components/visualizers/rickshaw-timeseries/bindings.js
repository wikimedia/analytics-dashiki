define(function(require) {

    var Rickshaw = require('rickshaw'),
        ko = require('knockout'),
        d3 = require('d3'),
        getBounds = require('utils').getBounds;

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
                width: opt.width || bounds.width * (opt.widthRatio || 13/16),
                height: opt.height || bounds.height * (opt.heightRatio || 5/6),
                renderer: 'multi',
                series: val.series,
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

            graphEl.shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
                graph: graphEl.graph,
                legend: graphEl.legend
            });

            graphEl.highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
                graph: graphEl.graph,
                legend: graphEl.legend
            });

            graphEl.hoverDetail = new Rickshaw.Graph.HoverDetail( {
                graph: graphEl.graph
            } );

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
        }
    };
});
