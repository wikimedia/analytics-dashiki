/* This simple view model just copies the parameters to itself */
'use strict';
define(function () {

    function CopyParams(params) {
        $.extend(this, params);
    }

    return CopyParams;
});
