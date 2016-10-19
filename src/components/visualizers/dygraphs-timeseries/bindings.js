'use strict';
define(function (require) {

    var ko = require('knockout'),
        moment = require('moment');

    require('dygraphs');
    require('./dygraphs.patch');

    ko.bindingHandlers.dygraphs = {
        init: function (element, valueAccessor) {
            var val = ko.unwrap(valueAccessor());

            if (val.height) {
                $(element).height(val.height);
            }

            $(element).append('<div class="flexed graph"></div>');
        },
        update: function (element, valueAccessor) {
            var $element = $(element),
                val = ko.unwrap(valueAccessor()),
                data = ko.unwrap(val.data),
                annotations = ko.unwrap(val.annotations),
                colors = val.colors,
                patterns = val.patterns,
                graph = $element.find('div.graph')[0];

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

                var dygraphChart = new window.Dygraph(
                    graph,
                    rows,
                    options
                );

                if (annotations) {
                    dygraphChart.ready(function () {
                        var i = 0,
                            $roller = $(dygraphChart.roller_),
                            $rollerHolder = $('<span class="dygraph-roller">Averaging: </span>');

                        dygraphChart.setAnnotations(annotations.rowData().map(function (a) {
                            // find the closest date in the data that fits
                            var closestDate = null;
                            var lastDistance = Math.pow(2, 53) - 1;
                            for (; i < rows.length; i++) {
                                var date = rows[i][0];
                                var thisDistance = Math.min(lastDistance, Math.abs(date.getTime() - a[0]));
                                // both arrays are sorted so the distance will only get further now
                                if (thisDistance === lastDistance) {
                                    i--;
                                    break;
                                }
                                lastDistance = thisDistance;
                                closestDate = rows[i][0];
                                // if we're at the end, and no date matched, prefix annotation with date
                                //   Also, handle other future dates the same by decrementing i
                                if (i === rows.length - 1) {
                                    a[1] = moment(a[0]).utc().format('YYYY-MM-DD ') + a[1];
                                    i--;
                                    break;
                                }
                            }
                            return {
                                // just attach to the first series and show on X axis
                                series: options.labels[1],
                                attachAtBottom: true,
                                shortText: 'A',
                                // annoying thing to learn through experimentation:
                                //   Dygraphs requires Date instances for the data, but
                                //   Dygraphs requires milliseconds since epoch for the annotations
                                x: closestDate.getTime(),
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
