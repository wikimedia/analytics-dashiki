/**
 * Generic component that can visualize funnel data.
 *
 * Example usage with default parameter values:

        <sunburst params="data: new TimeseriesData(), height: 500"/>
 */
define(function(require) {
    'use strict';

    var ko = require('knockout'),
        d3 = require('d3'),
        templateMarkup = require('text!./sunburst.html'),
        buildHierarchy = require('converters.funnel-data');

    require('./bindings');

    /**
     * Graphs sequences of steps as proportional concentric arcs
     *
     * Parameters
     *      data: TimeseriesData with rows that look like this:
                ['init', 5],
                ['init-ready-saveAttempt-saveSuccess', 75],
                ['init-ready-saveAttempt-saveFailure', 10],
                ['init-ready-abort', 10],
            colors: a function that takes a step name and returns its color
     */
    function Sunburst(params) {
        this.data = params.data;
        this.hierarchy = ko.computed(function() {
            return buildHierarchy(ko.unwrap(this.data).rowData());
        }, this);
        this.colors = params.colors || d3.scale.category10();

        this.height = params.height || 500;
        // width set by child once it renders
        this.width = ko.observable();
        // radius computed based on height and width
        this.radius = ko.computed(function(){
            return Math.min(this.height, this.width()) / 2;
        }, this);

        this.steps = ko.observable([]);
        this.percentage = ko.observable();
        this.ratio = ko.observable();

        var b = {
            w: 75, h: 30, s: 3, t: 10
        };
        this.b = b;
        this.getTransform = function (index, dx) {
            var i = ko.unwrap(index);
            return 'translate(' + (i * (b.w + b.s) + (dx || 0)) + ', 0)';
        };
        this.getPoints = function (index) {
            var i = ko.unwrap(index),
                points = [];

            points.push('0,0');
            points.push(b.w + ',0');
            points.push(b.w + b.t + ',' + (b.h / 2));
            points.push(b.w + ',' + b.h);
            points.push('0,' + b.h);
            if (i > 0) { // Leftmost breadcrumb
                points.push(b.t + ',' + (b.h / 2));
            }
            return points.join(' ');
        };
        this.crumb = {
            dy: '0.35em',
            x: (b.w + b.t) / 2,
            y: b.h / 2,
            'text-anchor': 'middle'
        };

    }

    return { viewModel: Sunburst, template: templateMarkup };
});
