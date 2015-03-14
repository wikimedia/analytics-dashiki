/**
 * Generic component that can visualize funnel data.
 *
 * Example usage with default parameter values:

        <sunburst params="tsv: [], height: 500"/>
 */
define(function(require) {

    var ko = require('knockout'),
        templateMarkup = require('text!./sunburst.html'),
        buildHierarchy = require('app/data-converters/funnel-data');

    require('./bindings');

    function Sunburst(params) {
        this.hierarchy = buildHierarchy(params.tsv || [
            ['init', 5],
            ['init-ready-saveAttempt-saveSuccess', 75],
            ['init-ready-saveAttempt-saveFailure', 10],
            ['init-ready-abort', 10],
        ]);
        this.colors = params.colors || {
            'init': '#5687d1',
            'ready': '#7b615c',
            'saveIntent': '#de783b',
            'saveAttempt': '#17becf',
            'saveSuccess': '#6ab975',
            'saveFailure': '#a173d1',
            'abort': '#bcbd22',
            'end': '#bbbbbb'
        };

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
        this.getTransform = function (index) {
            var i = ko.unwrap(index);
            return 'translate('+(i * (b.w + b.s))+', 0)';
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
