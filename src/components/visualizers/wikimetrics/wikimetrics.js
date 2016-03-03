'use strict';
/**
 * This component coordinates between the project, metric, and time selectors
 *   and visualizations.  Currently, it will render a single timeseries graph
 *   and attempt to recompute as infrequently as possible.
 *
 * Example usage:

        <wikimetrics params="
            metric      : -- on observable of your selected metric --
            projects    : -- an observable of your selected projects --
        "/>
 */
define(function (require) {

    var ko = require('knockout'),
        _ = require('lodash'),
        TimeseriesData = require('converters.timeseries'),
        templateMarkup = require('text!./wikimetrics.html'),
        annotationsApi = require('apis.annotations'),
        apiFinder = require('app/apis/api-finder');

    function WikimetricsVisualizer(params) {
        var visualizer = this;

        this.metric = params.metric;
        this.projects = params.projects;
        this.mergedData = ko.observable();

        this.datasets = ko.computed(function () {
            var projects = ko.unwrap(this.projects),
                metric = ko.unwrap(this.metric);

            if (metric && projects && projects.length) {
                var showBreakdown = ko.unwrap(metric.showBreakdown);

                var api = apiFinder(metric);

                var promises = projects.map(function (project) {
                    return api.getData(metric, project.database, showBreakdown);
                });

                //invoqued when all promises are done
                $.when.apply(this, promises).then(function () {
                    var timeseriesData = _.flatten(arguments);
                    this.mergedData(TimeseriesData.mergeAll(_.toArray(timeseriesData)));
                    this.applyColors(projects);
                }.bind(this));


            } else {
                this.mergedData(new TimeseriesData([]));
            }

        }, this);

        // get annotations as a TimeseriesData observable
        this.annotations = ko.observable();
        ko.computed(function () {
            var metric = ko.unwrap(this.metric);
            if (metric) {
                annotationsApi.getTimeseriesData(metric).done(this.annotations);
            }
        }, this);

        // build our own simple color scale to match the d3.scale.category10
        // because otherwise we'd have to import all of d3
        this.coloredProjects = [];
        this.colors = [
            '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
            '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
        ];
        this.colorScale = function (project) {
            var i = _.indexOf(visualizer.coloredProjects, project);
            if (i === -1) {
                i = visualizer.coloredProjects.push(project) - 1;
            }
            return visualizer.colors[i % visualizer.colors.length];
        };

        this.applyColors = function (projects) {
            projects.forEach(function (project) {
                project.color(visualizer.colorScale(project.database));
            });
        };
    }

    return {
        viewModel: WikimetricsVisualizer,
        template: templateMarkup
    };
});
