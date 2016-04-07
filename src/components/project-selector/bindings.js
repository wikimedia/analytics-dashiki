'use strict';
define(function (require) {

    var ko = require('knockout'),
        arrayUtils = require('utils.arrays');

    require('typeahead');

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
            }).sort(arrayUtils.sortByName);

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
                // This is complicated and needs explanation
                // This is the order of events when someone clicks a choice:
                //  * mousedown on the choice
                //  * blur away from the typeahead input box
                //  * mouseup on the choice
                //  * click on the choice (requires mousedown + mouseup)
                // The blur handler needs to run only if we're not clicking on
                // an option in the typeahead.  This is the reason for the event
                // handler below and tracking where the last mousedown was.
                if (ko.bindingHandlers.projectAutocomplete.mouseDownNotImportant) {
                    value.blur.call(viewModel);
                }
            });

            // set up a single mousedown / mouseup handler that informs the blur handler above
            if (ko.bindingHandlers.projectAutocomplete.mouseDownNotImportant === undefined) {
                ko.bindingHandlers.projectAutocomplete.mouseDownNotImportant = null;

                $(document).on('mousedown', function (event) {
                    ko.bindingHandlers.projectAutocomplete.mouseDownNotImportant =
                        $(event.target).closest('.tt-suggestion').length === 0;
                });

                $(document).on('mouseup', function () {
                    ko.bindingHandlers.projectAutocomplete.mouseDownNotImportant = null;
                });
            }
        } // end projectAutocomplete
    };
});
