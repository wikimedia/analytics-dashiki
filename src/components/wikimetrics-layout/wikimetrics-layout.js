define(['knockout', 'text!./wikimetrics-layout.html', 'wikimetricsApi', 'stateManager'], function (ko, templateMarkup, wikimetricsApi, stateManagerFactory) {
    'use strict';

    function WikimetricsLayout() {
        var self = this;

        // project and language observables
        self.selectedProjects = ko.observableArray([]);
        self.projectOptions = ko.observable([]);
        self.languageOptions = ko.observable([]);
        self.defaultProjects = ko.observable([]);
        self.reverseLookup = ko.observable();

        // metric observables
        self.selectedMetric = ko.observable();
        self.metrics = ko.observable([]);
        self.defaultMetrics = ko.observable([]);

        // Eagerly fetching the available projects to display in the project-selector
        wikimetricsApi.getProjectAndLanguageChoices(function (config) {
            self.languageOptions(config.languageOptions);
            self.projectOptions(config.projectOptions);
            self.reverseLookup(config.reverseLookup);
        });


        // state manager should be observing the selections of project and metric
        // returns a statemanager obj if you need it
        stateManagerFactory.getManager(this.selectedProjects, this.selectedMetric,
            this.defaultProjects, this.defaultMetrics);


        wikimetricsApi.getCategorizedMetrics(function (config) {
            self.metrics(config.categorizedMetrics);
        });
    }

    return {
        viewModel: WikimetricsLayout,
        template: templateMarkup
    };
});
