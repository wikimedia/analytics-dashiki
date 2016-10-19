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
        TimeseriesData = require('models.timeseries'),
        templateMarkup = require('text!./wikimetrics.html'),
        apiFinder = require('finders.api'),
        numberUtils = require('utils.numbers');

    var annotationsApi = apiFinder({api: 'annotations'});

    function WikimetricsVisualizer(params) {
        var visualizer = this;

        this.metric = params.metric;
        this.projects = params.projects;
        this.mergedData = ko.observable();
        this.breakdownColumns = params.breakdownColumns;
        this.patterns = params.patterns;

        this.datasets = ko.computed(function () {
            var projects = ko.unwrap(this.projects),
                breakdown = [],
                metric = ko.unwrap(this.metric);

            if (metric && projects && projects.length) {
                // make sure to listen to changes to the breakdown
                // mmm..don't like that this requires too much inside knowledge
                // of breakdown state
                if (metric.breakdown && this.breakdownColumns().length > 0) {
                    for (var i = 0; i < this.breakdownColumns().length; i++) {
                        var column = this.breakdownColumns()[i];
                        if (column.selected()) {
                            breakdown.push(column.label);
                        }
                    }
                }

                var api = apiFinder(metric);

                var promises = projects.map(function (project) {
                    return api.getData(metric, project.database, breakdown);
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

        // Stores the patterns of the current breakdown.
        // Whenever the breakdown changes, resets them.
        this.breakdownPatterns = [];
        ko.computed(function () {
            var columns = ko.unwrap(visualizer.breakdownColumns),
                mergedData = visualizer.mergedData(),
                breakdownPatterns = visualizer.breakdownPatterns;

            if (columns && columns.length > 1) {
                _.forEach(mergedData.patternLabels, function (patternLabel) {
                    if (_.indexOf(breakdownPatterns, patternLabel) === -1) {
                        breakdownPatterns.push(patternLabel);
                    }
                });
            } else {
                visualizer.breakdownPatterns = [];
            }
        }, this);

        // The patternScale assigns patterns to the labels passed.
        this.patternScale = function (patternLabel) {
            var i = _.indexOf(visualizer.breakdownPatterns, patternLabel);
            if (i !== -1) {
                return visualizer.patterns[i % visualizer.patterns.length];
            }
        };

        this.format = numberUtils.numberFormatter('kmb');

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
