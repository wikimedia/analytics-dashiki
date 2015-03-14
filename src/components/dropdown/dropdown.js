define(function (require) {
    'use strict';

    var templateMarkup = require('text!./dropdown.html'),
        SingleSelect = require('app/common-viewmodels/single-select');

    return {
        viewModel: SingleSelect,
        template: templateMarkup
    };
});
