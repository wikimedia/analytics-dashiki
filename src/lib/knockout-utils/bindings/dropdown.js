'use strict';
define(function (require) {
    var ko = require('knockout');

    require('semantic-dropdown');

    ko.bindingHandlers.dropdown = {
        init: function (element, valueAccessor) {

            $(element).dropdown(ko.unwrap(valueAccessor()));

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).dropdown('destroy');
            });
        }
    };
});
