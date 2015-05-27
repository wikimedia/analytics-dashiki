define(function (require) {
    'use strict';

    var d3 = require('d3'),
        templateMarkup = require('text!./compare-timeseries.html');

    function CompareTimeseries (params) {
        $.extend(this, params);
        this.colors = params.colors || d3.scale.category10();
    }

    return {
        viewModel: CompareTimeseries,
        template: templateMarkup
    };
});
