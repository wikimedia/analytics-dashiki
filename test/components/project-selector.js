'use strict';
define(function (require) {
    var component = require('components/selectors/project/project'),
        ko = require('knockout');

    var ProjectSelector = component.viewModel;

    describe('ProjectSelector view model', function () {

        it('should add binding to knockout', function () {
            expect(ko.bindingHandlers.projectAutocomplete).not.toBe(undefined);
        });

        it('should react to defaults and changes', function () {


            var wikipedia = {
                    code: 'wiki',
                    name: 'Wikipedia',
                    languages: {
                        Afar: 'aawiki',
                        Spanish: 'eswiki'

                    },
                    description: ['287 languages"']
                },
                wikibooks = {
                    code: 'wikibooks',
                    name: 'Wikibooks',
                    languages: {
                        Spanish: 'eswikibooks'
                    }
                },

                afar = {
                    name: 'Afar',
                    projects: {
                        wiki: 'aawiki',
                        wiktionary: 'aawiktionary'
                    },
                    description: ['blah'],
                    shortName: 'aa'
                },
                spanish = {
                    name: 'Spanish',
                    projects: {
                        wiki: 'eswiki',
                        wikibooks: 'eswikibooks'
                    },
                    description: ['blah'],
                    shortName: 'es'
                },

                aawiki = {
                    database: 'aawiki',
                    language: afar,
                    project: wikipedia
                },
                eswiki = {
                    database: 'eswiki',
                    language: spanish,
                    project: wikipedia
                },
                eswikibooks = {
                    database: 'eswikibooks',
                    language: spanish,
                    project: wikibooks
                },

                projectOptions = [wikipedia],
                languageOptions = [afar, spanish],
                params = {};


            params.reverseLookup = {
                aawiki: aawiki,
                eswiki: eswiki,
                eswikibooks: eswikibooks,
            };

            params.prettyProjectNames = {
                wiki: 'Wikipedia',
                wikibooks: 'Wikibooks',
                wiktionary: 'Pretty Wiki'
            };

            params.projectOptions = ko.observable(projectOptions);
            params.languageOptions = ko.observable(languageOptions);
            params.defaultProjects = ko.observable(['eswiki']);
            params.selectedProjects = ko.observableArray();

            // testing initialization
            var instance = new ProjectSelector(params);
            expect(instance.projectOptions()).toBe(params.projectOptions());
            expect(instance.languageOptions()).toBe(params.languageOptions());


            function doesSelectedProjectsByCategoryContainProject(project) {
                var found = false, c, i, languages,
                    categories = instance.selectedProjectsByCategory();

                for (c = 0; c < categories.length; c++) {
                    languages = categories[c].languages;
                    for (i = 0; i < languages.length; i++) {
                        if (languages[i].database === project.database) {
                            found = true;
                            break;
                        }
                    }
                }
                return found;
            }

            // are the defaults reflected in the selected projects and dependents
            expect(instance.selectedProjects.indexOf(eswiki) >= 0).toBe(true);
            expect(doesSelectedProjectsByCategoryContainProject(eswiki)).toBe(true);

            // add a project see it gets added
            instance.addProject(aawiki);

            // both selected projects and dependents update
            expect(instance.selectedProjects.indexOf(aawiki) >= 0).toBe(true);
            expect(doesSelectedProjectsByCategoryContainProject(aawiki)).toBe(true);

            // a color observable should've been added to all selected projects
            expect(eswiki.color).not.toBeUndefined();
            expect(aawiki.color).not.toBeUndefined();

            // remove everything but Wikipedia
            instance.removeCategory(true, instance.selectedProjectsByCategory()[0]);

            // nothing changes
            expect(instance.selectedProjects()).toEqual([eswiki, aawiki]);

            // now remove project
            instance.removeProject(eswiki);

            // both selected projects and dependents update
            expect(instance.selectedProjects.indexOf(eswiki) >= 0).toBe(false);
            expect(doesSelectedProjectsByCategoryContainProject(eswiki)).toBe(false);

            // adding a project from a different category is categorized
            instance.addProject(eswikibooks);

            expect(instance.selectedProjects.indexOf(eswikibooks) >= 0).toBe(true);
            expect(doesSelectedProjectsByCategoryContainProject(eswikibooks)).toBe(true);

            // remove both categories
            instance.removeCategory(false, instance.selectedProjectsByCategory()[0]);
            instance.removeCategory(false, instance.selectedProjectsByCategory()[0]);

            // all projects are gone
            expect(instance.selectedProjects()).toEqual([]);

            // select a project with only one language
            instance.displaySecondLevel.bind(instance, null, null)(wikibooks, 'projects');

            // the language is selected directly
            expect(instance.selectedProjects.indexOf(eswikibooks) >= 0).toBe(true);
            expect(doesSelectedProjectsByCategoryContainProject(eswikibooks)).toBe(true);
        });
    });
});
