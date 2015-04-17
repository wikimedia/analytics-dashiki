define(function (require) {
    'use strict';

    var templateMarkup = require('text!./compare-sunburst.html'),
        CopyParams = require('viewmodels.copy-params');

    return {
        viewModel: CopyParams,
        template: templateMarkup
    };
});
