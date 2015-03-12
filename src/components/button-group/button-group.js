define(function (require) {
    'use strict';

    var templateMarkup = require('text!./button-group.html'),
        SingleSelect = require('components/dropdown/dropdown').viewModel;

    return {
        viewModel: SingleSelect,
        template: templateMarkup
    };
});
