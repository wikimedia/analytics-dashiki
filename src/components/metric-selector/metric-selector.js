/**
 * This component allows the user to select a metric.
 *
 * Example usage:

        <metric-selector params="
            metrics             : array (plain, observable, or observableArray) of categories
                                    [
                                        {name: 'Something', metrics: [
                                            {name: 'one', submetric: 'one_1'},
                                            {name: 'two', submetric: 'two_1'},
                                        ]},
                                        {name: 'Else', metrics: [
                                            {name: 'three', submetric: 'three_1'},
                                        ]},
                                    ]
            selectedMetric      : an observable of the selected metric
            defaultSelection    : (optional) array of pre-added metric names
        "/>
 */
define(function (require) {
    'use strict';

    var ko = require('knockout'),
        templateMarkup = require('text!./metric-selector.html'),
        utils = require('utils');

    require('./bindings');

    function MetricSelector(params) {
        var self = this;

        this.metricsByCategory = params.metrics;
        this.selectedMetric = params.selectedMetric;
        this.selectedCategory = ko.observable();
        this.addedMetrics = ko.observableArray([]);

        this.defaultSelection = ko.computed(function () {
            var names = ko.unwrap(params.defaultSelection),
                metrics = ko.unwrap(this.metricsByCategory);

            if (!names || !metrics) {
                return [];
            }

            var defaultMetrics = [];
            metrics.forEach(function (category) {
                category.metrics.forEach(function (metric) {
                    if ($.inArray(metric.name, names) >= 0) {
                        defaultMetrics.push(metric);
                    }
                });
            });
            return defaultMetrics;
        }, this);

        this.categories = ko.computed(function () {
            var unwrap = ko.unwrap(this.metricsByCategory) || [],
                copy = unwrap.slice(),
                categories = copy.sort(utils.sortByNameIgnoreCase);

            categories.splice(0, 0, {
                name: 'All metrics',
                metrics: [].concat.apply([], categories.map(function (c) {
                    return c.metrics;
                })).sort(utils.sortByNameIgnoreCase)
            });

            if (categories.length) {
                this.selectedCategory(categories[0]);
            }
            return categories;
        }, this);

        // functions
        this.setDefault = function () {
            self.addedMetrics(self.defaultSelection() || []);
            self.reassignSelected();
        };

        this.selectCategory = function (category) {
            self.selectedCategory(category);
        };

        this.addMetric = function (metric) {
            if ($.inArray(metric, self.addedMetrics()) < 0) {
                self.addedMetrics.push(metric);
            }
            self.selectedMetric(metric);
        };

        this.removeMetric = function (metric) {
            self.addedMetrics.remove(metric);
            if (self.selectedMetric().name === metric.name) {
                self.reassignSelected();
            }
        };

        this.reassignSelected = function () {
            var candidate = self.addedMetrics().length ? self.addedMetrics()[0] : null;
            if (candidate !== self.selectedMetric()) {
                self.selectedMetric(candidate);
            }
        };

        this.selectMetric = function (metric) {
            self.selectedMetric(metric);
        };

        // set the default selection to something, even if empty
        this.setDefault();
        // process new defaults coming in
        this.defaultSelection.subscribe(this.setDefault, this);
        // start off with a metric selected, if metrics were pre-added but no default was picked
        this.reassignSelected();
    }

    return {
        viewModel: MetricSelector,
        template: templateMarkup
    };
});
