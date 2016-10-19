'use strict';
define(function (require) {

    var templateMarkup = require('text!./dropdown.html'),
        SingleSelect = require('viewmodels.single-select');

    return {
        viewModel: SingleSelect,
        template: templateMarkup
    };
});
