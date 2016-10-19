'use strict';
define(function (require) {

    var templateMarkup = require('text!./visualizer.html'),
        ko = require('knockout'),
        _ = require('lodash'),
        apiFinder = require('finders.api'),
        colorUtils = require('utils.colors'),
        numberUtils = require('utils.numbers'),
        TimeseriesData = require('models.timeseries'),
        moment = require('moment');

    require('knockout.datepicker');

    function Visualizer(params) {
        var api = apiFinder({
                api: 'datasets'
            }),
            graph = ko.unwrap(params);

        this.type = graph.type;
        this.title = graph.title;
        this.select = graph.select;
        this.selected = graph.selected;
        // TODO: add this property to the visualizers themselves and then reference
        // like visualizers[this.type].showColumnToggle
        this.columnToggle = this.type !== 'sunburst' && this.type !== 'hierarchy';

        var colorScale = colorUtils.category10();
        if (graph.colors) {
            var domain = [],
                range = [];
            _.forEach(graph.colors, function (val, key) {
                range.push(val);
                domain.push(key);
            });
            colorScale = colorUtils.category10(domain, range);
        }

        this.data = ko.observable(new TimeseriesData());
        api.getData(graph, 'all').done(this.data);

        this.startDate = ko.observable(graph.startDate);
        this.minDate = ko.observable(graph.startDate);
        this.endDate = ko.observable();

        /** If date is a unix tiemstamp change it to ISO format **/
        this.prettyDate = function (value) {
            if (Number.isInteger(value())) {
                return moment(value()).format('YYYY-MM-DD');
            }
            return value;
        };

        // turn the header into a list of items that can be selected / deselected
        // make it a computed so if the parent changes the data, this updates
        this.filteredHeader = ko.computed(function () {
            var data = ko.unwrap(this.data);

            if (!data) {
                return [];
            }

            var header = data.header.map(function (h, i) {
                return {
                    index: i,
                    title: h,
                    color: colorScale(data.colorLabels[i]),
                    patternLabel: data.patternLabels[i],
                    name: data.patternLabels[i] + ' - ' + h,
                    uniqueId: data.patternLabels[i] + ' - ' + h + (Math.floor(Math.random() * 100000)),
                    selected: ko.observable(true),
                    selectOnly: function () {
                        var onlyThis = this;

                        _.forEach(header, function (hOnly) {
                            hOnly.selected(hOnly === onlyThis);
                        });
                    },
                    selectAll: function () {
                        _.forEach(header, function (hOnly) {
                            hOnly.selected(true);
                        });
                    },
                };
            });

            return _.sortBy(header, function(h){ return h.title.toLowerCase(); });
        }, this);

        this.filteredData = ko.computed(function () {
            var data = ko.unwrap(this.data),
                start = ko.unwrap(this.startDate),
                end = ko.unwrap(this.endDate);

            if (!data) {
                return [];
            }

            var newHeader = _.filter(this.filteredHeader(), function (header) {
                return header.selected();
            });

            data.filter(start, end);

            return data.pickColumns(
                _.map(newHeader, 'title'),
                _.map(newHeader, 'patternLabel')
            );
        }, this).extend({
            rateLimit: 0
        });

        // make params for the underlying visualizer
        this.params = {
            data: this.filteredData,
            colors: colorScale,
            format: numberUtils.numberFormatter(graph.format),
            height: 500,
            id: _.kebabCase([graph.metric, graph.submetric].join('-')),
        };
        this.params.downloadLink = graph.downloadLink;
        this.legendHeight = this.params.height - 80 + 'px';
    }

    return {
        viewModel: Visualizer,
        template: templateMarkup
    };
});
