define(['knockout', 'text!./metric-selector.html'], function(ko, templateMarkup) {

    'use strict';

    function MetricSelector() {
        var self = this;
        self.loading = ko.observable();
    }

    return {
        viewModel: MetricSelector,
        template: templateMarkup
    };
});
