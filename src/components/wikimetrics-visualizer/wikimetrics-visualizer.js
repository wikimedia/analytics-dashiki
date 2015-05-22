/**
 * This component coordinates between the project, metric, and time selectors
 *   and visualizations.  Currently, it will render a single timeseries graph
 *   and attempt to recompute as infrequently as possible.
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
        _ = require('lodash'),
        TimeseriesData = require('converters.timeseries'),
        templateMarkup = require('text!./wikimetrics-visualizer.html'),
        apiFinder = require('app/apis/api-finder');

    function WikimetricsVisualizer(params) {
        var visualizer = this;

        this.metric = params.metric;
        this.projects = params.projects;
        this.mergedData = ko.observable();
        this.colorScale = ko.observable();

        this.applyColors = function (projects, color) {
            var scale = color || this.colorScale();
            if (scale) {
                projects.forEach(function (project) {
                    project.color(scale(project.database));
                });
            }
        };

        this.datasets = ko.computed(function () {
            var projects = ko.unwrap(this.projects),
                metric = ko.unwrap(this.metric);

            if (metric && projects && projects.length) {
                var promises,
                    showBreakdown = ko.unwrap(metric.showBreakdown);

                var api = apiFinder(metric);

                // NOTE: this is fetching all datafiles each time and relies on the cache
                // For a more optimal, but perhaps prematurely optimized, version see:
                //     https://gerrit.wikimedia.org/r/#/c/158244/8/src/components/wikimetrics-visualizer/wikimetrics-visualizer.js
                promises = projects.map(function (project) {
                    return api.getData(metric, project.database, showBreakdown);
                });
                $.when.apply(this, promises).then(function () {
                    visualizer.mergedData(TimeseriesData.mergeAll(_.toArray(arguments)));
                    visualizer.applyColors(projects);
                });
            } else {
                visualizer.mergedData(new TimeseriesData([]));
            }

        }, this);

        this.colorScale.subscribe(function (color) {
            var projects = ko.unwrap(this.projects);
            this.applyColors(projects, color);
        }, this);
    }

    return {
        viewModel: WikimetricsVisualizer,
        template: templateMarkup
    };
});
