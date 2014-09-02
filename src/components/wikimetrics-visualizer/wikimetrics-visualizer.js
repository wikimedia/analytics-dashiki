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

    function promiseKey(metric, project) {
        return {
            metric: metric,
            project: project,
            key: metric + '|' + project,
            toString: function () {
                return this.key;
            },
        };
    }

    function WikimetricsVisualizer(params) {
        var loadingPromises = {};

        this.metric = params.metric;
        this.projects = params.projects;

        this.mergedData = ko.observable();

        var visualizer = this;
        this.datasets = ko.computed(function () {
            var projects = ko.unwrap(this.projects),
                metric = ko.unwrap(this.metric);

            if (metric) {
                // 1. make sure there's a promise for every project that we want loaded
                projects.forEach(function (project) {
                    var key = promiseKey(metric, project);

                    if (!loadingPromises.hasOwnProperty(key)) {
                        loadingPromises[key] = api.get(metric, project).pipe(converter);
                    }
                });

                // 2. clear loading promises that are no longer needed
                // Every promise is holding about 7000 bytes on heap
                // w/o eviction this would be a memory leak
                Object.getOwnPropertyNames(loadingPromises).forEach(function (key) {
                    var split = key.split('|'),
                        m = split[0],
                        p = split[1];

                    if (metric !== m || projects.indexOf(p) < 0) {
                        delete loadingPromises[key];
                    }
                });

                // 3. concat results when all the promises get fulfilled
                var allPromises = Object.getOwnPropertyNames(loadingPromises).map(function (key) {
                    return loadingPromises[key];
                });
                $.when.apply(this, allPromises).then(function () {
                    visualizer.mergedData([].concat.apply([], arguments));
                });
            } else {
                loadingPromises = {};
                visualizer.mergedData([]);
            }

        }, this);
    }

    return {
        viewModel: WikimetricsVisualizer,
        template: templateMarkup
    };
});
