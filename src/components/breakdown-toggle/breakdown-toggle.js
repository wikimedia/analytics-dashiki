define(function (require) {
    'use strict';

    var templateMarkup = require('text!./breakdown-toggle.html');

    function BreakdownToggle(params) {
        var self = this;

        self.metric = params.metric;

        self.toggle = function () {
            self.metric().showBreakdown(!self.metric().showBreakdown());
        };

        self.dashes = function (index) {
            // NOTE: this is the same list used in the vega visualization
            // it would be possible to relate them directly but we should
            // think carefully about the interface to that component.
            return [
                '',
                '2, 5',
                '15, 15',
                '30, 5',
            ][index() + 1];
        };
    }

    return {
        viewModel: BreakdownToggle,
        template: templateMarkup
    };
});
