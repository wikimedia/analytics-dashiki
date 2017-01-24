define(function(require) {
    var ko = require('knockout'),
        d3 = require('d3'),
        _ = require('lodash'),
        template = require('text!./worldmap.html');

    require('./bindings');

    function WorldmapVisualizer (params) {
        this.data = params.data;
        this.date = params.date;
    }

    return {
        viewModel: WorldmapVisualizer,
        template: template
    };
})