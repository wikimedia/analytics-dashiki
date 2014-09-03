define(['knockout', 'text!./wikimetrics-layout.html', 'wikimetricsApi'], function (ko, templateMarkup, wikimetricsApi) {
    'use strict';

    function WikimetricsLayout() {
        var self = this;

        // project and language observables
        self.selectedProjects = ko.observableArray([]);
        self.projectOptions = ko.observable([]);
        self.languageOptions = ko.observable([]);
        self.defaultProjects = ko.observable([]);
        self.reverseLookup = ko.observable();
        self.prettyProjectNames = ko.observable();

        // metric observables
        self.selectedMetric = ko.observable();
        self.metrics = ko.observable([]);
        self.defaultMetrics = ko.observable([]);

        // Eagerly fetching the available projects to display in the project-selector
        wikimetricsApi.getProjectAndLanguageChoices(function (config) {
            self.languageOptions(config.languageOptions);
            self.projectOptions(config.projectOptions);
            self.reverseLookup(config.reverseLookup);
            self.prettyProjectNames(config.prettyProjectNames);
        });

        wikimetricsApi.getDefaultDashboard(function (config) {
            self.defaultProjects(config.defaultProjects);
            self.defaultMetrics(config.defaultMetrics);
        });

        wikimetricsApi.getCategorizedMetrics(function (config) {
            self.metrics(config.categorizedMetrics);
        });
    }

    return {
        viewModel: WikimetricsLayout,
        template: templateMarkup
    };
});
