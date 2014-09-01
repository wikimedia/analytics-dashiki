define(['knockout', 'text!./wikimetrics-layout.html', 'wikimetricsApi'], function (ko, templateMarkup, wikimetricsApi) {
    'use strict';

    /**
     * Eagerly fetching the available projects to display
     * in the project-selector.
     * TODO make sure that performance wise this is a suitable
     * option
     **/
    function WikimetricsLayout() {
        var self = this;
        self.selectedMetric = ko.observable();
        self.selectedProjects = ko.observableArray([]);
        self.projectOptions = ko.observable([]);
        self.languageOptions = ko.observable([]);
        self.defaultProjects = ko.observable([]);
        self.reverseLookup = ko.observable();
        self.prettyProjectNames = ko.observable();

        wikimetricsApi.getProjectAndLanguageChoices(function () {
            self.languageOptions(wikimetricsApi.languageOptions);
            self.projectOptions(wikimetricsApi.projectOptions);
            self.defaultProjects(wikimetricsApi.defaultProjects);
            self.reverseLookup(wikimetricsApi.reverseLookup);
            self.prettyProjectNames(wikimetricsApi.prettyProjectNames);
        });

        /** infer selected projects from defaultProjectSelection object which is taylored for the ui **/


        self.metricData = ko.observable();
        wikimetricsApi.getCategorizedMetrics(self.metricData);

        self.metrics = ko.computed(function () {
            var configData = this.metricData();
            if (configData) {
                return configData.categorizedMetrics;
            }
            return [];
        }, self);

        self.defaultMetrics = ko.computed(function () {
            var configData = this.metricData();
            if (configData) {
                return configData.defaultMetrics;
            }
            return [];
        }, self);
    }

    return {
        viewModel: WikimetricsLayout,
        template: templateMarkup
    };
});
