/**
 * This component allows the user to select a metric.
 *
 * Example usage:

        <metric-selector params="
            metrics             : array (plain, observable, or observableArray) of categories
                                    [
                                        {name: 'Something', metrics: ['one','two'},
                                        {name: 'Else', metrics: ['three']}
                                    ]
            selectedMetric      : an observable of the selected metric
            defaultSelection    : (optional) array of pre-added metric names
        "/>
 */
define(function(require) {
    'use strict';

    var ko              = require('knockout'),
        templateMarkup  = require('text!./metric-selector.html');

    require('./bindings');

    function MetricSelector(params) {
        var self = this;

        self.open = ko.observable(false);
        self.toggle = function () {
            this.open(!this.open());
        };

        self.selectedMetric = params.selectedMetric;
        self.addedMetrics = ko.observableArray([]);

        if (ko.isObservable(params.defaultSelection)) {
            params.defaultSelection.subscribe(function() {
                self.addedMetrics(ko.unwrap(this));
            }, params.defaultSelection);
        }
        self.addedMetrics(ko.unwrap(params.defaultSelection) || []);

        self.selectedCategory = ko.observable();

        self.categories = ko.computed(function(){
            var unwrap = ko.unwrap(params.metrics) || [],
                copy = unwrap.slice(),
                categories = copy.sort(function(a, b){
                    return a.name === b.name ?
                        0 : a.name > b.name ? 1 : -1;
                });

            categories.splice(0, 0, {
                name: 'All metrics',
                metrics: [].concat.apply([], categories.map(function(c) {
                    return c.metrics;
                })).sort()
            });

            if (categories.length) {
                this.selectedCategory(categories[0]);
            }
            return categories;
        }, self);

        self.selectCategory = function (category) {
            self.selectedCategory(category);
        };

        self.addMetric = function (name) {
            if (self.addedMetrics.indexOf(name) >= 0) {
                return;
            }
            self.addedMetrics.push(name);
            self.reassignSelected();
        };

        self.removeMetric = function (name) {
            self.addedMetrics.remove(name);
            if (self.selectedMetric() === name) {
                self.selectedMetric(null);
                self.reassignSelected();
            }
        };

        self.reassignSelected = function () {
            if (!self.selectedMetric()) {
                self.selectedMetric(
                    self.addedMetrics().length ? self.addedMetrics()[0] : null
                );
            }
        };

        self.selectMetric = function (name) {
            self.selectedMetric(name);
        };

        // start off with a metric selected, if metrics were pre-added but no default was picked
        self.reassignSelected();
    }

    return {
        viewModel: MetricSelector,
        template: templateMarkup
    };
});
