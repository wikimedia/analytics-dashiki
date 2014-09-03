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

    function WikimetricsVisualizer(params) {
        var visualizer = this;

        this.metric = params.metric;
        this.projects = params.projects;
        this.mergedData = ko.observable();

        this.datasets = ko.computed(function () {
            var projects = ko.unwrap(this.projects),
                metric = ko.unwrap(this.metric),
                configuredConverter;

            if (metric && projects && projects.length) {
                var submetrics = {},
                    promises;

                submetrics[metric.name] = metric.submetric || metric.defaultSubmetric;
                configuredConverter = converter.bind(null, submetrics);

                // NOTE: this is fetching all datafiles each time and relies on the cache
                // For a more optimal, but perhaps prematurely optimized, version see:
                //     https://gerrit.wikimedia.org/r/#/c/158244/8/src/components/wikimetrics-visualizer/wikimetrics-visualizer.js
                promises = projects.map(function (project) {
                    return api.getData(metric.name, project).pipe(configuredConverter);
                });
                $.when.apply(this, promises).then(function () {
                    visualizer.mergedData([].concat.apply([], arguments));
                });
            } else {
                visualizer.mergedData([]);
            }

        }, this);
    }

    return {
        viewModel: WikimetricsVisualizer,
        template: templateMarkup
    };
});
