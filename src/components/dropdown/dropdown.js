define(function (require) {
    'use strict';

    var templateMarkup = require('text!./dropdown.html');

    // this is used in dropdown and button-group, could factor it out
    function SingleSelect(params) {
        this.selectOne = params.selectOne;
        this.select = function (option) {
            this.selectOne.selected(option);
        }.bind(this);
    }

    return {
        viewModel: SingleSelect,
        template: templateMarkup
    };
});
