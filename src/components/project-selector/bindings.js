define(['knockout', 'utils', 'typeahead'], function (ko, utils) {
    'use strict';

    // Data is an array of option objects
    function substringMatcher(data, minLength) {
        return function findMatches(query, callback) {
            var unwrapped = ko.unwrap(data);
            var matches, substrRegex;

            if (minLength && query.length < minLength) {
                callback([]);
                return;
            }

            // regex used to determine if a string contains "query"
            substrRegex = new RegExp(query, 'i');

            // an array that will be populated with substring matches
            matches = unwrapped.filter(function (item) {
                return substrRegex.test(item.name);
            }).sort(utils.sortByName);

            callback(matches);
        };
    }

    function makeTemplate(header) {
        return {
            header: '<span class="header">' + header + '</span><hr/>',
            suggestion: function (data) {
                return '<span class="text-muted">' + data.name + '<span class="footnote">' + data.description + '</span></span>';
            }
        };
    }

    /**
     * Define custom bindings for autocomplete
     **/
    ko.bindingHandlers.projectAutocomplete = {

        init: function (element, valueAccessor, allBindings, viewModel) {

            var value = ko.unwrap(valueAccessor());
            var projectOptions = value.projectOptions;
            var languageOptions = value.languageOptions;
            var databaseOptions = value.databaseOptions;

            $(element).typeahead({
                    hint: false,
                    highlight: true,
                    minLength: 1
                }, {
                    name: 'projects',
                    displayKey: 'value',
                    templates: makeTemplate('Projects'),
                    source: substringMatcher(projectOptions)
                }, {
                    name: 'languages',
                    displayKey: 'value',
                    templates: makeTemplate('Languages'),
                    source: substringMatcher(languageOptions)
                }, {
                    name: 'databases',
                    displayKey: 'value',
                    templates: makeTemplate('Databases'),
                    source: substringMatcher(databaseOptions, 5)
                }

            ).bind('typeahead:selected', value.select.bind(viewModel, element));

            $(element).on('blur', function () {
                // Without this timeout, blur will happen before the click
                // that selects the project, so the click will happen after
                // the close and therefore miss the target.
                setTimeout(value.blur.bind(viewModel), 100);
            });
        } // end projectAutocomplete
    };
});
