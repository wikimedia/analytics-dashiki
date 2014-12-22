define(function(require) {
    'use strict';

    var ko = require('knockout');

    require('semantic-popup'); // add popup functionalities to jquery

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
