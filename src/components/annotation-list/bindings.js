'use strict';
define(function(require) {

    var ko = require('knockout');

    require('semantic2-popup'); // add popup functionalities to jquery

    ko.bindingHandlers.popup = {
        init: function (element, valueAccessor) {
            $(element).popup({
                content: valueAccessor(),
                delay: {show: 0},
                duration: 0
            });
        }
    };
});
