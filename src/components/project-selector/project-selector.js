/* jshint -W098 */
define(['knockout', 'text!./project-selector.html', './bindings'], function (ko, templateMarkup) {
    'use strict';

    function ProjectSelector(params) {

        this.projectOptions = params.projectOptions();
        this.languageOptions = params.languageOptions();
        /** options selected upon bootstrap if any **/
        this.defaultProjects = params.defaultProjects;
        this.displaySuboptions = ko.observable(false);
        this.selectedOption = ko.observable();
        this.suboptions = ko.observableArray([]);
    }

    function makeOptions(obj) {
        return Object.getOwnPropertyNames(obj).map(function (p) {
            return {
                option: p
            };
        });
    }

    ProjectSelector.prototype.displaySecondLevel = function (event, suggestion, datasetName) {

        this.displaySuboptions(true);
        this.selectedOption(suggestion.name);
        var secondLevelOptions = datasetName === 'projects' ? 'languages' : 'projects';
        this.suboptions(makeOptions(suggestion[secondLevelOptions]));
    };

    ProjectSelector.prototype.hideSecondLevel = function () {

        this.displaySuboptions(false);
        this.selectedOption();
        this.suboptions([]);
    };

    return {
        viewModel: ProjectSelector,
        template: templateMarkup
    };
});
