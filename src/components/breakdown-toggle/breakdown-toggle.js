'use strict';
/**
 * This component does not show if metric does not include a breakdown
 * Component should be as dumb as possible and does not even
 * need to know about a metric
 * It should really just manipulate a breakdown object.
 **/
define(function (require) {
    var ko = require('knockout');
    var templateMarkup = require('text!./breakdown-toggle.html');

    function BreakdownToggle(params) {
        var self = this;
        var patterns = params.patterns;
        var dashes = patterns.map(
            function (item) {
                return item.toString();
            });


        this.metric = ko.unwrap(params.metric);


        this.breakdownState = params.breakdownState;

        var state = {};
        state.display = ko.observable(false);
        state.columns = ko.observableArray([]);

        this.breakdownState(state);

        // update state object with breakdown display specifics
        this.metric.breakdown.columns.forEach(function (label, index) {
            // repeat pattern if more than dashes.length
            var _index = index % dashes.length;
            this.breakdownState().columns().push({
                selected: ko.observable(true),
                label: label,

                pattern: dashes[_index]
            });
        }.bind(this));

        this.toggle = function () {
            self.breakdownState().display(!self.breakdownState().display());
        };

        // if we are down to 1 checkbox disable it as we need
        // at least 1 breakdown to show data
        this.isOnlyOneSelected = ko.computed(function () {
            var possibleBreakdowns = this.breakdownState().columns().length;
            var breakdownsSelected = 0;
            for (var i = 0; i < possibleBreakdowns; i++) {
                var column = this.breakdownState().columns()[i];
                if (column.selected()) {
                    breakdownsSelected++;
                }
            }

            return breakdownsSelected === 1;
        }.bind(this));



    }

    return {
        viewModel: BreakdownToggle,
        template: templateMarkup
    };
});