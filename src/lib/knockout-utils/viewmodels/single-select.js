define(function () {
    'use strict';

    function SingleSelect(params) {
        this.selectOne = params.selectOne;
        this.select = function (option) {
            this.selectOne.selected(option);
        }.bind(this);

        // let views use a single formatting function
        this.format = this.selectOne.format || function (d) { return d; };
    }

    return SingleSelect;
});
