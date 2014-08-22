define(['knockout', 'text!./project-selector.html'], function(ko, templateMarkup) {

    'use strict';

    function ProjectSelector() {
        var self = this;
        self.loading = ko.observable();
    }

    return {
        viewModel: ProjectSelector,
        template: templateMarkup
    };
});
