define(function(require) {

    var CopyParams = require('viewmodels.copy-params'),
        templateMarkup = require('text!./dygraphs-timeseries.html');

    require('./bindings');

    return {
        viewModel: CopyParams,
        template: templateMarkup
    };
});