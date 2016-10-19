'use strict';
define(function(require) {

    var CopyParams = require('viewmodels.copy-params'),
        templateMarkup = require('text!./stacked-bars.html');

    require('./bindings');

    return {
        viewModel: CopyParams,
        template: templateMarkup
    };
});
