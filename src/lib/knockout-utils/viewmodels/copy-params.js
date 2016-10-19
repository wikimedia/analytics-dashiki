/* This simple view model just copies the parameters to itself */
define(function () {
    'use strict';

    function CopyParams(params) {
        $.extend(this, params);
    }

    return CopyParams;
});
