'use strict';
define(function (require) {

    var ko              = require('knockout'),
        templateMarkup  = require('text!./project.html'),
        arrayUtils      = require('utils.arrays');
    require('./bindings');

    function ProjectSelector(params) {
        this.selectedProjects = params.selectedProjects;

        this.projectOptions = params.projectOptions;
        this.languageOptions = params.languageOptions;
        this.reverseLookup = params.reverseLookup;

        this.displaySuboptions = ko.observable(false);
        this.selectedOption = ko.observable();
        this.suboptions = ko.observable([]);

        this.databaseOptions = ko.computed(function () {
            var reverse = ko.unwrap(this.reverseLookup);
            if (!reverse) {
                return [];
            }
            return Object.getOwnPropertyNames(reverse).map(function (database) {
                return {name: database, description: ''};
            });
        }, this);

        var self = this,
            updateDefault = function () {
                var defaultDatabases = ko.unwrap(params.defaultProjects),
                    reverse = ko.unwrap(params.reverseLookup),
                    defaultProjects;

                if (!reverse || !defaultDatabases) {
                    return;
                }

                defaultProjects = Object.getOwnPropertyNames(reverse)
                    .filter(function (database) {
                        return defaultDatabases.indexOf(database) >= 0;
                    }).map(function (database) {
                        return reverse[database];
                    });

                self.selectedProjects(defaultProjects);
            };
        params.defaultProjects.subscribe(updateDefault);
        if (ko.isObservable(params.reverseLookup)) {
            params.reverseLookup.subscribe(updateDefault);
        }
        updateDefault();

        /**
         * Transform selected projects to display by category in the UI
         **/
        this.selectedProjectsByCategory = ko.computed(function () {
            var projects = {};

            this.selectedProjects().forEach(function (info) {

                if (!info.color) {
                    // these will live for the life of the page, but that should
                    // be ok and make re-selecting faster
                    info.color = ko.observable();
                }
                if (!projects.hasOwnProperty(info.project.code)) {
                    projects[info.project.code] = {
                        name: info.project.name,
                        languages: []
                    };
                }
                projects[info.project.code].languages.push({
                    name: info.language.name,
                    database: info.database,
                    shortName: info.language.shortName,
                    color: info.color
                });
            });

            return Object.getOwnPropertyNames(projects).map(function (p) {
                return projects[p];
            });
        }, this);
    }

    function makeOptions(obj, reverse) {
        return Object.getOwnPropertyNames(obj).map(function (p) {
            return {
                name: reverse ? reverse[obj[p]].project.name || p : p,
                project: obj[p]
            };
        });
    }

    ProjectSelector.prototype.displaySecondLevel = function (event, element, selection, datasetName) {
        var options = [],
            reverse = ko.unwrap(this.reverseLookup) || {};

        this.displaySuboptions(true);
        this.selectedOption(selection.name);
        switch (datasetName) {
            case 'projects':
                var choices = Object.getOwnPropertyNames(selection.languages);
                if (choices.length === 1) {
                    this.addProject({project: selection.languages[choices[0]]});
                    $(element).trigger('blur');
                    return;
                }
                options = makeOptions(selection.languages);
                break;
            case 'languages':
                options = makeOptions(selection.projects, reverse);
                break;
            case 'databases':
                this.addProject({project: selection.name});
                return;
        }
        options.sort(arrayUtils.sortByNameIgnoreCase);
        this.suboptions(options);
    };

    ProjectSelector.prototype.hideSecondLevel = function () {

        this.displaySuboptions(false);
        this.selectedOption();
        this.suboptions([]);
    };

    // Parameters
    //   data   : can be one of two types of objects:
    //            * an item in reverseLookup, which has a database name
    //            * a ProjectOption item which has a project
    ProjectSelector.prototype.addProject = function (data) {
        var reverse = ko.unwrap(this.reverseLookup),
            toAdd = data.database ? data : reverse[data.project];

        if (this.selectedProjects.indexOf(toAdd) < 0) {
            this.selectedProjects.push(toAdd);
        }
        this.hideSecondLevel();
    };

    // Parameters
    //   data   : can be one of two types of objects:
    //            * an item in selectedProjects which has a database name
    //            * an item in selectedProjectsByCategory which has a database name
    ProjectSelector.prototype.removeProject = function (data) {
        var reverse = ko.unwrap(this.reverseLookup),
            toRemove = reverse[data.database];

        this.selectedProjects.remove(toRemove);
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
        var selectedProjects = ko.utils.arrayFilter(this.selectedProjects(), function (item) {
            var languages = data.languages,
                i, keep;

            for (i = 0; i < languages.length; i++) {
                if (removeOthers) {
                    keep = item.database === languages[i].database;
                    if (keep) {
                        break;
                    }
                } else {
                    keep = item.database !== languages[i].database;
                    if (!keep) {
                        break;
                    }
                }
            }
            return keep;
        });
        this.selectedProjects(selectedProjects);
    };

    return {
        viewModel: ProjectSelector,
        template: templateMarkup
    };
});
