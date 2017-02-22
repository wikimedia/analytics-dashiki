'use strict';
define(function(require) {
    var template = require('text!./worldmap.html');

    require('./bindings');

    function WorldmapVisualizer (params) {
        this.data = params.data;
        this.date = params.date;
    }

    return {
        viewModel: WorldmapVisualizer,
        template: template
    };
});
