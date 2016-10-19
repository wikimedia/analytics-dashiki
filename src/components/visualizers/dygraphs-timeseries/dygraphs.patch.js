'use strict';
define(function(require) {

    require('dygraphs');

    var L = window.Dygraph.Plugins.Legend;
    var escapeHTML = function(str) {
        return str.replace(/&/g, '&amp;').replace(/'/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    /* patch the way the legend HTML is generated.
     * This kind of override appears to be supported in the next version of
     *   Dygraphs, but that's not out yet
     */
    window.Dygraph.Plugins.Legend.generateLegendHTML = function(g, x, sel_points, oneEmWidth, row) {
        // todo(danvk): deprecate this option in place of {legend: 'never'}
        if (g.getOption('showLabelsOnHighlight') !== true) { return ''; }

        // If no points are selected, we display a default legend. Traditionally,
        // this has been blank. But a better default would be a conventional legend,
        // which provides essential information for a non-interactive chart.
        var html, sepLines, i, dash, strokePattern;
        var labels = g.getLabels();
        sepLines = g.getOption('labelsSeparateLines');

        if (typeof x === 'undefined') {
            if (g.getOption('legend') !== 'always') {
                return '';
            }

            html = '';
            for (i = 1; i < labels.length; i++) {
                var series = g.getPropertiesForSeries(labels[i]);
                if (!series.visible) { continue; }

                if (html !== '') { html += (sepLines ? '<br/>' : ' '); }
                strokePattern = g.getOption('strokePattern', labels[i]);
                dash = L.generateLegendDashHTML(strokePattern, series.color, oneEmWidth);
                html += '<span style="font-weight: bold; color: ' + series.color + ';">' +
                        dash + ' ' + escapeHTML(labels[i]) + '</span>';
            }
            return html;
        }

        // todo(danvk): remove this use of a private API
        var xOptView = g.optionsViewForAxis_('x');
        var xvf = xOptView('valueFormatter');
        html = xvf.call(g, x, xOptView, labels[0], g, row, 0);
        if (html !== '') {
            html += sepLines ? '<hr/>' : ':';
        }

        var yOptViews = [];
        var num_axes = g.numAxes();
        for (i = 0; i < num_axes; i++) {
            // todo(danvk): remove this use of a private API
            yOptViews[i] = g.optionsViewForAxis_('y' + (i ? 1 + i : ''));
        }
        var showZeros = g.getOption('labelsShowZeroValues');
        var highlightSeries = g.getHighlightSeries();
        sel_points = sel_points.sort(function (a, b) {
            if(!isFinite(a.yval - b.yval)) {
                return isFinite(a.yval) ? 1 : -1;
            }
            return b.yval - a.yval;
        });
        for (i = 0; i < sel_points.length; i++) {
            var pt = sel_points[i];
            if (pt.yval === 0 && !showZeros) { continue; }
            if (!window.Dygraph.isOK(pt.canvasy)) { continue; }
            var seriesProps = g.getPropertiesForSeries(pt.name);
            var yOptView = yOptViews[seriesProps.axis - 1];
            var fmtFunc = yOptView('valueFormatter');
            var yval = fmtFunc.call(g, pt.yval, yOptView, pt.name, g, row, labels.indexOf(pt.name));

            var cls = (pt.name === highlightSeries) ? ' class="highlight"' : '';

            // todo(danvk): use a template string here and make it an attribute.
            html += '<span' + cls + '>' +
                        '<span>' + yval + '</span>' +
                        '<label style="color: ' + seriesProps.color + ';">' +
                            escapeHTML(pt.name) +
                        '</label>' +
                    '</span>';
            if (sepLines) { html += '<br/>'; }
        }
        return html;
    };
});
