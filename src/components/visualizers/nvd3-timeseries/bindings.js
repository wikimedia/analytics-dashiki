define(function(require) {

    var ko = require('knockout'),
        d3 = require('d3'),
        nv = require('nvd3');

    ko.bindingHandlers.nvLineFocus = {
        init: function (element, valueAccessor) {
            var val = ko.unwrap(valueAccessor()),
                chart = nv.models.lineWithFocusChart();

            chart.lines.xScale(d3.time.scale());
            chart.lines2.xScale(d3.time.scale());

            var timeFormat = d3.time.format('%Y-%m-%d');
            chart.xAxis.tickFormat(timeFormat).showMaxMin(false);
            chart.x2Axis.tickFormat(timeFormat).showMaxMin(false);
            chart.yAxis.showMaxMin(false);
            chart.y2Axis.showMaxMin(false);

            element.root = d3.select(element).select(val.graphSelect).append('svg');
            element.root.datum([]).call(chart);

            // These are glitchy but not sure if to leave them on or off
            //chart.useVoronoi(false);
            //chart.clipVoronoi(false);

            nv.utils.windowResize(chart.update);

            element.chart = chart;
        },
        update: function (element, valueAccessor) {
            var val = ko.unwrap(valueAccessor());

            element.root.datum(val.series().map(function(serie) {
                return {
                    key: serie.name,
                    values: serie.data,
                    color: serie.color,
                    // NOTE: This does not appear to work
                    classed: serie.renderer === 'line' ? undefined : 'dashed',
                };
            })).call(element.chart);
        }
    };
});
