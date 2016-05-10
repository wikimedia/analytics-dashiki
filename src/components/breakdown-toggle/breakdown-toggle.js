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

    function getBreakdownColumns(metric, dashes) {
        var breakdownColumns = [];
        if (metric && metric.breakdown) {
            metric.breakdown.columns.forEach(function (label, index) {
                // repeat pattern if more than dashes.length
                var _index = index % dashes.length;
                breakdownColumns.push({
                    selected: ko.observable(true),
                    label: label,
                    pattern: dashes[_index]
                });
            });
        }
        return breakdownColumns;
    }

    function BreakdownToggle(params) {
        this.patterns = params.patterns;

        this.metric = params.metric;

        this.dashes = this.patterns.map(
            function (item) {
                return item.toString();
            });

        this.display = ko.observable(false);

        //observable defined by parent component
        this.columns = params.breakdownColumns;


        // Update UI state when metric changes.
        params.metric.subscribe(function () {
            // metric gets passed but we do not really need it
            this.display(false);
            this.columns([]);
        }.bind(this));

        this.toggle = function () {
            //showing, compute columns
            if (!this.display()) {
                this.columns(getBreakdownColumns(this.metric(), this.dashes));
            } else {
                this.columns([]);
            }

            this.display(!this.display());
        };

        // if we are down to 1 checkbox disable it as we need
        // at least 1 breakdown to show data
        this.isOnlyOneSelected = ko.computed(function () {
            if (this.columns) {
                var possibleBreakdowns = this.columns().length;
                var breakdownsSelected = 0;
                for (var i = 0; i < possibleBreakdowns; i++) {
                    var column = this.columns()[i];
                    if (column.selected()) {
                        breakdownsSelected++;
                    }
                }
                return breakdownsSelected === 1;
            }
        }.bind(this));
    }

    return {
        viewModel: BreakdownToggle,
        template: templateMarkup
    };
});