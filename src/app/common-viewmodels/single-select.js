define(function () {
    'use strict';

    function SingleSelect(params) {
        this.selectOne = params.selectOne;
        this.select = function (option) {
            this.selectOne.selected(option);
        }.bind(this);
    }

    return SingleSelect;
});
