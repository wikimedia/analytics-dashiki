define(['knockout', 'text!./selection-visualizer.html'], function(ko, templateMarkup) {

    'use strict';

    function SelectionVisualizer() {
        var self = this;
        self.loading = ko.observable();
    }

    return {
        viewModel: SelectionVisualizer,
        template: templateMarkup
    };
});
