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
        wikimetricsApi = require('wikimetricsApi'),
        pageviewApi = require('pageviewApi');


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
                var promises;

                var api = getAPIFromMetric(metric);

                // NOTE: this is fetching all datafiles each time and relies on the cache
                // For a more optimal, but perhaps prematurely optimized, version see:
                //     https://gerrit.wikimedia.org/r/#/c/158244/8/src/components/wikimetrics-visualizer/wikimetrics-visualizer.js
                promises = projects.map(function (project) {
                    return api.getData(metric, project.database);
                });
                $.when.apply(this, promises).then(function () {
                    visualizer.mergedData([].concat.apply([], arguments));
                    visualizer.applyColors(projects);
                });
            } else {
                visualizer.mergedData([]);
            }

        }, this);

        this.colorScale.subscribe(function (color) {
            var projects = ko.unwrap(this.projects);
            this.applyColors(projects, color);
        }, this);
    }

    // TODO, still WIP
    // finalize when pageview API is active
    // is there a better place for this function
    function getAPIFromMetric(metric) {
        // Now the metric has to carry the notion of the API that holds its data
        // we want the metric configuration file be backwards compatible
        // so we add a new attribute to metric called api
        // the default (if API not specified) is the wikimetrics API
        // example:
        // {
        //  "definition": "https://meta.wikimedia.org/wiki/Research:Rolling_blah_editor",
        //  "defaultSubmetric": "rolling_blah_editor",
        //  "name": "RollingBlahEditor",
        //  "api": "blahAPI"
        // },

        if (metric.api) {
            if (metric.api.match('pageview')) {
                return pageviewApi;
            }

        } else {
            return wikimetricsApi;
        }
    }

    return {
        viewModel: WikimetricsVisualizer,
        template: templateMarkup
    };
});