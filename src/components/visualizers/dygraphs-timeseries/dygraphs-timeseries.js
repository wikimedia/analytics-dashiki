'use strict';

define(function(require) {
    var templateMarkup = require('text!./dygraphs-timeseries.html');

    require('./bindings');

    function DygraphsTimeseries (params) {
        this.annotations = params.annotations;
        this.colors = params.colors;
        this.data = params.data;
        this.format = params.format;
        this.height = params.height;
        this.patterns = params.patterns || function () {
            return ''; // Default to solid line.
        };
    }

    return {
        viewModel: DygraphsTimeseries,
        template: templateMarkup
    };
});
