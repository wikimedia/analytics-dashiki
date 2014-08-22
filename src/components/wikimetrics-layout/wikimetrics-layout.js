define(['knockout', 'text!./wikimetrics-layout.html'], function(ko, templateMarkup) {

    'use strict';

    function WikimetricsLayout() {
        var self = this;
        self.loading = ko.observable();
    }

    return { viewModel: WikimetricsLayout, template: templateMarkup };
});
