define(function(require) {

    var CopyParams = require('app/common-viewmodels/copy-params'),
        templateMarkup = require('text!./nvd3-timeseries.html');

    require('./bindings');

    return {
        viewModel: CopyParams,
        template: templateMarkup
    };
});
