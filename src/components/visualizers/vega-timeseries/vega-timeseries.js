/**
 * Generic component that can visualize timeseries data.
 *
 * Example usage that shows data format and available parameters with defaults:

        <vega-timeseries params="data: [
            {date: new Date('2014-01-01'), value: 12, label: 'one'},
            {date: new Date('2014-01-02'), value: 2, label: 'one'},
            {date: new Date('2014-01-03'), value: 4, label: 'one'},
            {date: new Date('2014-01-01'), value: 1, label: 'two'},
            {date: new Date('2014-01-02'), value: 6, label: 'two'},
            {date: new Date('2014-01-03'), value: 20, label: 'two'}
        ],
            width           : 'auto',
            height          : 'auto',
            parentSelector  : '.parent-of-resizable',
            animate         : false,
            padding         : {top: 30, right: 40, bottom: 30, left: 35},
            strokeWidth     : 2
            colorScale      : undefined (pass a ko.observable to monitor color)
        "/>
 */
define(function(require) {

    var templateMarkup = require('text!./vega-timeseries.html'),
        CopyParams = require('app/common-viewmodels/copy-params');

    require('./bindings');

    return { viewModel: CopyParams, template: templateMarkup };
});
