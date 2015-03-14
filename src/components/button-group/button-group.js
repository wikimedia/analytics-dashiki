define(function (require) {
    'use strict';

    var templateMarkup = require('text!./button-group.html'),
        SingleSelect = require('app/common-viewmodels/single-select');

    return {
        viewModel: SingleSelect,
        template: templateMarkup
    };
});
