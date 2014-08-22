define(['knockout', 'text!./time-selector.html'], function(ko, templateMarkup) {

    'use strict';

    function TimeSelector() {
        var self = this;
        self.loading = ko.observable();
    }

    return {
        viewModel: TimeSelector,
        template: templateMarkup
    };
});
