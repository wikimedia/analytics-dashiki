'use strict';
define(function (require) {
    var ko = require('knockout');

    require('semantic2-popup');
    require('semantic2-transition');

    ko.bindingHandlers.popup = {
        init: function (element, valueAccessor) {

            $(element).popup(ko.unwrap(valueAccessor()));

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).popup('destroy');
            });
        }
    };
});
