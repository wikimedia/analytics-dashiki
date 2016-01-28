define(function (require) {
    'use strict';

    var ko = require('knockout'),
        _ = require('lodash'),
        templateMarkup = require('text!./filter-timeseries.html');

    function FilterTimeseries (params) {
        this.data = params.data;

        // turn the header into a list of items that can be selected / deselected
        // make it a computed so if the parent changes the data, this updates
        this.filteredHeader = ko.computed(function () {
            var data = ko.unwrap(this.data);

            if (!data) {
                return [];
            }

            return data.header.map(function (h, i){
                return {
                    index: i,
                    title: h,
                    patternLabel: data.patternLabels[i],
                    name: data.patternLabels[i] + ' - ' + h,
                    uniqueId: data.patternLabels[i] + ' - ' + h + (Math.floor(Math.random() * 100000)),
                    selected: ko.observable(true)
                };
            });
        }, this);

        // split up by category so we can control the display better
        this.categorizedHeader = ko.computed(function () {
            var header = ko.unwrap(this.filteredHeader);

            return _(header).transform(function (categorized, column) {
                categorized[column.patternLabel] = categorized[column.patternLabel] || [];
                categorized[column.patternLabel].push(column);
            }, {}).transform(function (categories, columns, category) {
                categories.push({
                    name: category,
                    columns: columns,
                });
            }, []).value();
        }, this);

        this.filteredData = ko.computed(function () {
            var data = ko.unwrap(this.data);

            if (!data) {
                return [];
            }

            var newHeader = _.filter(this.filteredHeader(), function (header) {
                return header.selected();
            });

            return data.pickColumns(
                _.pluck(newHeader, 'title'),
                _.pluck(newHeader, 'patternLabel')
            );
        }, this);

        this.colors = params.colors;
        this.annotations = params.annotations;
    }

    return {
        viewModel: FilterTimeseries,
        template: templateMarkup
    };
});
