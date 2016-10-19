'use strict';
define(function (require) {

    var templateMarkup = require('text!./a-b-compare.html'),
        CopyParams = require('viewmodels.copy-params');

    return {
        viewModel: CopyParams,
        template: templateMarkup
    };
});
