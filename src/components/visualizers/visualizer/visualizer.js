'use strict';
define(function (require) {

    var templateMarkup = require('text!./visualizer.html'),
        ko = require('knockout'),
        _ = require('lodash'),
        apiFinder = require('api-finder'),
        utils = require('utils'),
        TimeseriesData = require('converters.timeseries');

    function Visualizer (params) {
        var api = apiFinder({api: 'datasets'}),
            graph = ko.unwrap(params);

        this.type = graph.type;
        this.title = graph.title;
        this.select = graph.select;
        this.selected = graph.selected;

        var colorScale = utils.category10();
        if (graph.colors) {
            var domain = [], range = [];
            _.forEach(graph.colors, function (val, key) {
                range.push(val);
                domain.push(key);
            });
            colorScale = utils.category10(domain, range);
        }

        this.params = {
            data:  ko.observable(new TimeseriesData()),
            colors: colorScale,
            height: 500,
            id: _.kebabCase([graph.metric, graph.submetric].join('-')),
        };

        api.getData(graph, 'all').done(this.params.data);
        this.params.downloadLink = graph.downloadLink;
    }

    return {
        viewModel: Visualizer,
        template: templateMarkup
    };
});
