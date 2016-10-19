'use strict';
define(function (require) {

    var templateMarkup = require('text!./compare-stacked-bars.html'),
        CopyParams = require('viewmodels.copy-params');

    return {
        viewModel: CopyParams,
        template: templateMarkup
    };
});
