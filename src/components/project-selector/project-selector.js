/* jshint -W098 */
define(function (require) {
    'use strict';

    var ko              = require('knockout'),
        templateMarkup  = require('text!./project-selector.html'),
        utils           = require('utils');
    require('./bindings');

    function ProjectSelector(params) {
        this.selectedProjects = params.selectedProjects;

        this.projectOptions = params.projectOptions;
        this.languageOptions = params.languageOptions;
        this.reverseLookup = params.reverseLookup;
        this.prettyProjectNames = params.prettyProjectNames;

        this.displaySuboptions = ko.observable(false);
        this.selectedOption = ko.observable();
        this.suboptions = ko.observable([]);

        this.codeOptions = ko.computed(function () {
            var reverse = ko.unwrap(this.reverseLookup);
            if (!reverse) {
                return [];
            }
            return Object.getOwnPropertyNames(reverse).map(function (code) {
                return {name: code, description: ''};
            });
        }, this);

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
        switch (datasetName) {
            case 'projects':
                options = makeOptions(selection.languages);
                break;
            case 'languages':
                options = makeOptions(selection.projects, ko.unwrap(this.prettyProjectNames));
                break;
            case 'codes':
                this.addProject({project: selection.name});
                return;
        }
        options.sort(utils.sortByNameIgnoreCase);
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

    /**
     * Parameters
     *   removeOthers   : if true, remove all *other* categories besides this one
     *   data           : category data, passed by default
     *
     * NOTE: call this with the ProjectSelector as the context
     **/
    ProjectSelector.prototype.removeCategory = function (removeOthers, data) {
        // change the whole selectedProjects array at once
        // so as to send updates only once
        var _selectedProjects = ko.utils.arrayFilter(this.selectedProjects(), function (item) {
            var languages = data.languages,
                i, keep;

            for (i = 0; i < languages.length; i++) {
                if (removeOthers) {
                    keep = item === languages[i].projectCode;
                    if (keep) {
                        break;
                    }
                } else {
                    keep = item !== languages[i].projectCode;
                    if (!keep) {
                        break;
                    }
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
