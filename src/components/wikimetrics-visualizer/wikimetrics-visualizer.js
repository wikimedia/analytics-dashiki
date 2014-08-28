/**
 * This component coordinates between the project, metric, and time selectors
 *   and visualizations.  Currently, it will render a single timeseries graph
 *   and attempt to recompute as infrequently as possible by using knockout
 *   projections.
 *
 * Example usage:

        <wikimetrics-visualizer params="
            metric      : -- on observable of your selected metric --
            projects    : -- an observable of your selected projects --
        "/>
 */
define(function (require) {
    'use strict';

    var ko = require('knockout'),
        templateMarkup = require('text!./wikimetrics-visualizer.html'),
        api = require('wikimetricsApi'),
        converter = require('app/data-converters/wikimetrics-timeseries');

    require('knockout-projections');

    function WikimetricsDataset(metric, project) {
        this.metric = metric;
        this.project = project;
        // this is an array but we don't need to react to single value changes
        // NOTE: this could become an array to enable real-time refreshing
        this.data = ko.observable([]);

        this.load = ko.computed(function () {
            var self = this,
                m = self.metric(),
                p = self.project;

            // only re-fetch the data for a truthy metric/project combination
            if (m && p) {
                api.get(m, p).pipe(converter).done(function (converted) {
                    self.data(converted);
                });
            }
        }, this);
    }

    function WikimetricsVisualizer(params) {
        var self = this;
        self.metric = params.metric;
        self.projects = params.projects;

        self.datasets = self.projects.map(function (project) {
            return new WikimetricsDataset(self.metric, project);
        });
        self.mergedData = ko.computed(function () {
            return [].concat.apply([], this.datasets.map(function (set) {
                return set.data();
            })());
        }, self);
    }

    return {
        viewModel: WikimetricsVisualizer,
        template: templateMarkup
    };
});
