define(function(require) {

    var Rickshaw = require('rickshaw'),
        d3 = require('d3');

    Rickshaw.namespace('Rickshaw.Graph.Renderer.DashedLine');
    Rickshaw.Graph.Renderer.DashedLine = Rickshaw.Class.create( Rickshaw.Graph.Renderer, {

        name: 'dashed-line',

        defaults: function($super) {

            return Rickshaw.extend( $super(), {
                unstack: true,
                fill: false,
                stroke: true
            } );
        },

        seriesPathFactory: function() {

            var graph = this.graph;

            var factory = d3.svg.line()
                .x( function(d) { return graph.x(d.x); } )
                .y( function(d) { return graph.y(d.y); } )
                .interpolate(this.graph.interpolation).tension(this.tension);

            if(factory.defined) {
                factory.defined( function(d) { return d.y !== null; } );
            }
            return factory;
        },

        _styleSeries: function(series) {
            var fill = this.fill ? series.color : 'none';
            var stroke = this.stroke ? series.color : 'none';

            series.path.setAttribute('fill', fill);
            series.path.setAttribute('stroke', stroke);
            series.path.setAttribute('stroke-width', this.strokeWidth);

            if (series.className) {
                d3.select(series.path).classed(series.className, true);
            }
            if (series.className && this.stroke) {
                d3.select(series.stroke).classed(series.className, true);
            }
            // This is the only line that changed, is there a better way?
            series.path.setAttribute('stroke-dasharray', '5,5');
        }
    } );
});
