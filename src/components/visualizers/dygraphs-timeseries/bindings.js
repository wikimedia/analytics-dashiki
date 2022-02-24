'use strict';
define(function (require) {

    var ko = require('knockout'),
        moment = require('moment'),
        _ = require("lodash");

    require('dygraphs');
    require('./dygraphs.patch');

    ko.bindingHandlers.dygraphs = {
        init: function (element, valueAccessor) {
            var val = ko.unwrap(valueAccessor());

            $(element).append('<div class="graph"></div>');
        },
        update: function (element, valueAccessor) {
            var $element = $(element),
                val = ko.unwrap(valueAccessor()),
                data = ko.unwrap(val.data),
                annotations = ko.unwrap(val.annotations),
                colors = val.colors,
                patterns = val.patterns,
                graph = $element.find('div.graph'),
                height = val.height;

            if (data && data.header && data.header.length) {
                var rows = data.rowData({
                    convertToDate: true
                });
                var options = {
                    axes: {
                        x: {
                            valueFormatter: function (d) {
                                // assumes dates are in UTC format
                                return moment(d).utc().format('YYYY-MM-DD');
                            },
                            axisLabelWidth: 77,
                        },
                        y: {
                            valueFormatter: val.format,
                            axisLabelFormatter: val.format,
                            valueRange: [0]
                        },
                    },
                    labels: ['Date'],
                    strokeWidth: 1.8,
                    gridLineColor: '#cacaca',
                    gridLinePattern: [10, 5],
                    series: {},
                    showRoller: true,
                    animatedZooms: true,
                    labelsSeparateLines: true,
                };



                data.header.forEach(function (column, i) {
                    var label = data.patternLabels[i] === column ? data.colorLabels[i] + ': ' + column : isNaN(data.patternLabels[i]) ? column + ': ' + data.patternLabels[i] : column;
                    options.labels.push(label);
                    options.series[label] = {
                        color: colors(data.colorLabels[i]),
                        strokePattern: patterns(data.patternLabels[i]),
                    };
                });

                if (!height) {
                    var tallParent = graph.parents('.full.height');
                    if (tallParent.length > 0) {
                        height = tallParent[0].clientHeight - 40;
                    }
                }

                if (height) {
                    graph.height(height);
                }

                var dygraphChart = new window.Dygraph(
                    graph[0],
                    rows,
                    options
                );

                if (annotations) {
                    dygraphChart.ready(function () {
                        var $roller = $(dygraphChart.roller_),
                            $rollerHolder = $('<span class="dygraph-roller">Averaging: </span>'),
                            charCode = 65,
                            snapIndex = -1;

                        // Snap annotation dates to the closest data point
                        var snappedAnnotations = annotations.rowData().map(function (a) {

                            // Efficiently iterate data points to find closest one
                            for (var i = snapIndex + 1; i < rows.length; i++) {
                                if (a[0] >= rows[i][0].getTime()) {
                                    snapIndex = i;
                                } else {
                                    break;
                                }
                            }

                            // Format annotation
                            var snappedDate, message;
                            if (snapIndex === -1) {
                                // The annotation is set before the first data point.
                                // Attach it to the first data point, prefixed with its date.
                                snappedDate = rows[0][0].getTime();
                                message = moment(a[0]).utc().format('YYYY-MM-DD ') + a[1];
                            } else if (snapIndex === rows.length - 1) {
                                // The annotation is set after the last data point.
                                // Attach it to the last data point, prefixed with its date.
                                snappedDate = rows[rows.length - 1][0].getTime();
                                message = moment(a[0]).utc().format('YYYY-MM-DD ') + a[1];
                            } else {
                                // The annotation is set in between two data points.
                                // Attach it to the earlier data point, no prefix.
                                snappedDate = rows[snapIndex][0].getTime();
                                message = a[1];
                            }

                            return [snappedDate, message];
                        });

                        // Merge annotations that got snapped to the same date
                        var mergedAnnotations = _
                            .chain(snappedAnnotations)
                            .groupBy(function (a) { return a[0]; })
                            .toPairs()
                            .sortBy(function (g) { return g[0]; })
                            .map(function (g) {
                                return [
                                    g[0],
                                    g[1].map(function (a) {
                                        return a[1];
                                    }).join("\n\n")
                                ];
                            })
                            .value();

                        // Format annotations for dygraphs to parse
                        dygraphChart.setAnnotations(mergedAnnotations.map(function (a) {
                            return {
                                // just attach to the first series and show on X axis
                                series: options.labels[1],
                                attachAtBottom: true,
                                tickHeight: 0,
                                shortText: String.fromCharCode(charCode++),
                                // annoying thing to learn through experimentation:
                                //   Dygraphs requires Date instances for the data, but
                                //   Dygraphs requires milliseconds since epoch for the annotations
                                x: a[0],
                                text: a[1],
                            };
                        }));

                        // move the roller to the top and add a label
                        $rollerHolder.append($roller.detach()).append(' day(s)');
                        // remove the previous roller if any
                        $element.siblings('.dygraph-roller').remove();
                        $rollerHolder.insertBefore($element);
                    });
                }
            }
        },
    };
});
