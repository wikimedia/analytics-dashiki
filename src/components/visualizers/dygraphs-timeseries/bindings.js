define(function(require) {

    var ko = require('knockout'),
        moment = require('moment');

    require('dygraphs');

    ko.bindingHandlers.dygraphs = {
        update: function (element, valueAccessor) {
            var val = ko.unwrap(valueAccessor()),
                graph = $(element).find(val.graphSelect)[0],
                data = ko.unwrap(val.data),
                annotations = ko.unwrap(val.annotations),
                colors = val.colors;

            if (data.rows && data.rows.length) {
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
                    };

                data.header.slice(1).forEach(function (column, i) {
                    var label = data.label[i+1] + ': ' + column;
                    options.labels.push(label);
                    options.series[label] = {
                        color: colors(column),
                        strokePattern: data.label[i+1] === data.primary ? null : [5, 5],
                    };
                });
                var dygraphChart = new window.Dygraph(
                    graph,
                    data.rows,
                    options
                );
                if (annotations && annotations.rows.length) {
                    dygraphChart.ready(function () {
                        dygraphChart.setAnnotations(annotations.rows.map(function (a) {
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
