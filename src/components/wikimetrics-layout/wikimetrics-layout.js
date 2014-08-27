define(['knockout', 'text!./wikimetrics-layout.html'], function(ko, templateMarkup) {

    'use strict';

    function WikimetricsLayout() {
        var self = this;
        self.selectedMetric = ko.observable();
        self.selectedProjects = ko.observableArray();
    }

    return { viewModel: WikimetricsLayout, template: templateMarkup };
});
