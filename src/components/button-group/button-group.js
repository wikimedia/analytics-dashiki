'use strict';
define(function (require) {

    var templateMarkup = require('text!./button-group.html'),
        SingleSelect = require('viewmodels.single-select');

    return {
        viewModel: SingleSelect,
        template: templateMarkup
    };
});
