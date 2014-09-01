define(['components/project-selector/project-selector', 'knockout'], function (component, ko) {
    'use strict';

    var ProjectSelector = component.viewModel;

    describe('ProjectSelector view model', function () {

        it('should add binding to knockout', function () {
            expect(ko.bindingHandlers.projectAutocomplete).not.toBe(undefined);
        });

        it('project selection updates category display on ui', function () {


            var projectOptions = [{
                code: "wiki",
                name: "Wikipedia",
                languages: {
                    Abkhazian: "abwiki",
                    Achinese: "acewiki",
                    Afar: "aawiki",
                    Afrikaans: "afwiki",
                    Spanish: "eswiki"

                },
                description: ['287 languages"']
            }];
            var languageOptions = [{
                name: "Afar",
                projects: {
                    wiki: "aawiki",
                    wiktionary: "aawiktionary"
                },
                description: ['blah'],
                shortName: "aa"
            }, {
                name: "Spanish",
                projects: {
                    wiki: "eswiki",
                    wiktionary: "eswiktionary"
                },
                description: ['blah'],
                shortName: "es"
            }];

            var params = {};
            params.reverseLookup = {
                'aawiki': {
                    'language': "Afar",
                    'project': "wiki"
                },
                'eswiki': {
                    'language': 'Spanish',
                    'project': 'wiki'
                }

            };

            params.prettyProjectNames = {
                wiki: "Wikipedia",
                wikibooks: "Wikibooks",
                wiktionary: "Pretty Wiki"
            };

            params.projectOptions = ko.observable(projectOptions);
            params.languageOptions = ko.observable(languageOptions);
            params.defaultProjects = ko.observable(["eswiki"]);
            params.selectedProjects = ko.observableArray(["eswiki"]);

            // testing initialization
            var instance = new ProjectSelector(params);
            expect(instance.projectOptions).toBe(params.projectOptions());
            expect(instance.languageOptions).toBe(params.languageOptions());


            function doesSelectedProjectsByCategoryContainProject(project) {
                var found = false;
                // testing, assuming just 1 element
                var languages = instance.selectedProjectsByCategory()[0].languages;
                for (var i = 0; i < languages.length; i++) {
                    if (languages[i].projectCode === project) {
                        found = true;
                        break;
                    }
                }
                return found;
            }

            // is ui what it should be?
            expect(doesSelectedProjectsByCategoryContainProject('eswiki')).toBe(true);


            // add a project see it gets added
            instance.addProject({
                'project': 'aawiki'
            });

            expect(instance.selectedProjects.indexOf('aawiki') > 0).toBe(true);

            // make sure ui list is updated
            expect(doesSelectedProjectsByCategoryContainProject('aawiki')).toBe(true);

            // now remove project
            instance.removeProject({
                'projectCode': 'eswiki'
            });

            // is ui what it should be?
            expect(doesSelectedProjectsByCategoryContainProject('eswiki')).toBe(false);


        });

    });

});
