define(function(require) {
    'use strict';

    var ko = require('knockout'),
        _ = require('lodash'),
        moment = require('moment');

    require('dygraphs');

    ko.bindingHandlers.dygraphs = {
        update: function (element, valueAccessor) {
            var val = ko.unwrap(valueAccessor()),
                data = ko.unwrap(val.data),
                annotations = ko.unwrap(val.annotations),
                colors = val.colors;

            var graph = $(element).append(
                $('<div/>').addClass('resizable').addClass('container')
            ).find('div.resizable')[0];

            if (data) {
                var rows = data.rowData({convertToDate: true});
                var options = {
                        valueFormatter: function(d, weirdFunction, type) {
                            if (type === 'Date') {
                                return moment(d).format('YYYY-MM-DD');
                            }
                            return d.toFixed(3);
                        },
                        labels: ['Date'],
                        labelsDivWidth: 350,
                        labelsDivStyles: {
                            'margin-left': '-120px',
                            'backgroundColor': 'rgba(255, 255, 255, 0.9)',
                            'padding': '4px',
                            'border': '1px solid #dadada',
                            'borderRadius': '5px',
                            'boxShadow': '2px 2px 2px #aaa',
                            'textAlign': 'left',
                            'fontFamily': 'sans-serif',
                        },
                        labelsSeparateLines: true,
                        strokeWidth: 1.8,
                        gridLineColor: '#cacaca',
                        gridLinePattern: [10, 5],
                        series: {},
                        showRoller: true,
                    };

                var patterns = _(data.patternLabels)
                                    .uniq()
                                    .zipObject([[], [5, 5], [15, 15], [30, 5]])
                                    .value();

                data.header.forEach(function (column, i) {
                    var label = data.patternLabels[i] + ': ' + column;
                    options.labels.push(label);
                    options.series[label] = {
                        color: colors(data.colorLabels[i]),
                        strokePattern: patterns[data.patternLabels[i]],
                    };
                });

                var dygraphChart = new window.Dygraph(
                    graph,
                    rows,
                    options
                );

                if (annotations) {
                    dygraphChart.ready(function () {
                        dygraphChart.setAnnotations(annotations.rowData().map(function (a) {
                            return {
                                // just attach to the first series and show on X axis
                                series: options.labels[1],
                                attachAtBottom: true,
                                shortText: 'D',
                                // strip time information from the annotation so it matches the data
                                x: new Date(a[0].getFullYear(), a[0].getMonth(), a[0].getDate()).getTime(),
                                text: a[1],
                            };
                        }));
                    });
                }
            }
        },
    };
});
