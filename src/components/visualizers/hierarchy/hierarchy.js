/**
 * Generic component that displays hierarchical data.
 * Example usage with default parameter values:
 *     <hierarchy params="data: new TimeseriesData(), height: 500"/>
 */
'use strict';
define(function(require) {

    var ko = require('knockout'),
        templateMarkup = require('text!./hierarchy.html'),
        buildHierarchy = require('converters.hierarchy-data');

    require('./bindings');

    /**
     * Extracts a hierarchy path from a row of input.
     * From: ['2016-01-01', 'iOS', '9', 'Mobile Safari', '9', 75432]
     * To: ['iOS', '9', 'Mobile Safari', '9']
     */
    function splitPath (row) {
        return row.slice(1, row.length - 1);
    }

    /**
     * Graphs hierarchical data as concentric arcs.
     *
     * Parameters
     *     data: TimeseriesData with rows that look like this:
     *         [date, value1, value2, ..., valueN, count]
     *         for example:
     *         ['2016-01-01', 'iOS', '9', 'Mobile Safari', '9', 75432],
     *         ['2016-01-01', 'Windows', '7', 'Chrome', '47', 56308],
     *         ['2016-01-02', 'Android', '5', 'Chrome Mobile', '47', 30554],
     *         ['2016-01-02', 'Windows', '7', 'IE', '11', 28062],
     */
    function Hierarchy(params) {
        this.hierarchy = ko.computed(function() {
            return buildHierarchy(ko.unwrap(params.data).rowData(), splitPath);
        }, this);

        this.height = params.height || 500;
        this.width = ko.observable(); // Set by bindings once it renders.
        this.radius = ko.computed(function(){
            return Math.min(this.height, this.width()) / 2;
        }, this);

        this.within = ko.observable([]);
        this.represents = ko.observable([]);
        this.percentage = ko.observable();

        // Measures of the breadcrumb's bounding boxes.
        var b = this.b = {
            w: 80, h: 30, s: 3, t: 10
        };
        // Horizontal translation of boxes.
        this.getTransform = function (index, dx) {
            var i = ko.unwrap(index);
            return 'translate(' + (i * (b.w + b.s) + (dx || 0)) + ', 0)';
        };
        // Initial position of secondary breadcrumbs.
        this.getRepresentsPadding = function () {
            var padding = (b.w + b.s) * this.within().length;
            return padding ? padding + 15 : 0;
        };
        // Initial position of percentage value.
        this.getPercentagePadding = function () {
            return (
                this.getRepresentsPadding() + (b.w + b.s) *
                this.represents().length
            );
        };
        // Coordinates of the box depending on the case.
        this.getPoints = function (index, within) {
            var i = ko.unwrap(index),
                points = [],
                noArrow = (within && i === this.within().length - 1);

            points.push('0,0');
            points.push((noArrow ? b.w + b.t : b.w) + ',0');
            points.push(b.w + b.t + ',' + (b.h / 2));
            points.push((noArrow ? b.w + b.t : b.w) + ',' + b.h);
            points.push('0,' + b.h);
            if (i > 0) { // Not leftmost breadcrumb
                points.push(b.t + ',' + (b.h / 2));
            }
            return points.join(' ');
        };
        // Color of the text depending on the box color.
        this.getTextColor = function (boxColor) {
            var rgb = boxColor.rgb();
            return rgb.r + rgb.g + rgb.b > 384 ? 'black' : 'white';
        };
        // Properties of the text within the boxes.
        this.crumb = {
            dy: '0.35em',
            x: (b.w + b.t) / 2,
            y: b.h / 2,
            'text-anchor': 'middle'
        };
    }

    return { viewModel: Hierarchy, template: templateMarkup };
});
