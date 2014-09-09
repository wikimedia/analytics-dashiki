/* jshint -W098 */
define(['knockout', 'text!./project-selector.html', './bindings'], function (ko, templateMarkup) {
    'use strict';

    function ProjectSelector(params) {
        this.selectedProjects = params.selectedProjects;

        this.selectedProjects = params.selectedProjects;
        this.projectOptions = params.projectOptions();
        this.languageOptions = params.languageOptions();
        this.reverseLookup = params.reverseLookup;
        this.prettyProjectNames = params.prettyProjectNames;

        this.displaySuboptions = ko.observable(false);
        this.selectedOption = ko.observable();
        this.suboptions = ko.observable([]);

        this.open = ko.observable(false);

        var self = this,
            updateDefault = function () {
                self.selectedProjects(ko.unwrap(params.defaultProjects));
            };
        params.defaultProjects.subscribe(updateDefault);
        updateDefault();

        /**
         * This is purely a UI object
         **/
        this.selectedProjectsByCategory = ko.computed(function () {
            var projects = {},
                reverse = ko.unwrap(self.reverseLookup) || {},
                pretty = ko.unwrap(self.prettyProjectNames) || {};

            this.selectedProjects().forEach(function (project) {
                var info = reverse[project];
                if (!info) {
                    return;
                }
                if (!projects.hasOwnProperty(info.project)) {
                    projects[info.project] = {
                        name: pretty[info.project] || info.project,
                        open: ko.observable(false),
                        languages: []
                    };
                }
                projects[info.project].languages.push({
                    name: info.language,
                    projectCode: project
                });
            });

            return Object.getOwnPropertyNames(projects).map(function (p) {
                return projects[p];
            });
        }, this);

        this.toggle = function (data) {
            var _open = data.open();
            data.open(!_open);

        };
    }

    function makeOptions(obj, prettyNames) {
        return Object.getOwnPropertyNames(obj).map(function (p) {
            return {
                name: prettyNames ? prettyNames[p] || p : p,
                project: obj[p]
            };
        });
    }

    ProjectSelector.prototype.displaySecondLevel = function (event, selection, datasetName) {
        var options = [];

        this.displaySuboptions(true);
        this.selectedOption(selection.name);
        if (datasetName === 'projects') {
            options = makeOptions(selection.languages);
        } else {
            options = makeOptions(selection.projects, ko.unwrap(this.prettyProjectNames));
        }
        this.suboptions(options);
    };

    ProjectSelector.prototype.hideSecondLevel = function () {

        this.displaySuboptions(false);
        this.selectedOption();
        this.suboptions([]);
    };

    ProjectSelector.prototype.addProject = function (data) {

        if (this.selectedProjects.indexOf(data.project) < 0) {
            this.selectedProjects.push(data.project);
        }
        this.hideSecondLevel();
    };

    ProjectSelector.prototype.removeProject = function (data) {

        if (this.selectedProjects.indexOf(data.projectCode) >= 0) {
            this.selectedProjects.remove(data.projectCode);
        }
    };

    ProjectSelector.prototype.removeCategory = function (data) {
        // change the whole selectedProjects array at once
        // so as to send updates only once
        var _selectedProjects = ko.utils.arrayFilter(this.selectedProjects(), function (item) {
            var languages = data.languages;
            for (var i = 0; i < languages.length; i++) {
                //remove them if they are equal
                var keep = true;
                if (item === languages[i].projectCode) {
                    keep = false;
                    break;
                }
            }
            return keep;
        });
        this.selectedProjects(_selectedProjects);
    };

    return {
        viewModel: ProjectSelector,
        template: templateMarkup
    };
});
