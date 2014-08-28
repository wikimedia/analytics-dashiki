define(['components/project-selector/project-selector', 'knockout'], function (component, ko) {
    var ProjectSelector = component.viewModel;

    describe('ProjectSelector view model', function () {

        it('should add binding to knockout', function () {
            expect(ko.bindingHandlers.projectAutocomplete).not.toBe(undefined);
        });

        it('initialization with parameters satisfies component interface', function () {


            var projectOptions = [{
                "name": "English",
                "description": "All projects",
                "projects": {
                    "Wikipedia": "eswiki",
                    "Somethingwiki": "somewiki",
                    "Wikidictionary": "somewiki"
                }
            }, {
                "name": "German",
                "description": "All projects",
                "projects": {
                    "Wikipedia": "dewiki",
                    "SomethingGermanWiki": "somewiki",
                    "Wikidictionary": "somewiki"
                }
            }];
            var languageOptions = [{
                "name": "Wikipedia",
                "description": "280 languages",
                "languages": {
                    "Spanish": "eswiki",
                    "English": "enwiki",
                    "German": "dewiki"
                }
            }, {
                "name": "WikiSomething",
                "description": "100 languages",
                "languages": {
                    "Spanish": "eswiki",
                    "English": "enwiki",
                    "German": "dewiki"
                }
            }];

            var params = {};
            params.projectOptions = ko.observableArray(projectOptions);
            params.languageOptions = ko.observableArray(languageOptions);
            params.defaultSelection = [];

            var instance = new ProjectSelector(params);
            expect(instance.projectOptions).toBe(params.projectOptions());
            expect(instance.languageOptions).toBe(params.languageOptions());
        });

    });

});
