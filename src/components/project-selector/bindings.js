define(['knockout', 'typeahead'], function (ko) {

    // Data is an array of option objects
    function substringMatcher(data) {
        return function findMatches(query, callback) {
            var matches, substrRegex;

            // regex used to determine if a string contains "query"
            substrRegex = new RegExp(query, 'i');

            // an array that will be populated with substring matches
            matches = data.filter(function (item) {
                return substrRegex.test(item.name);
            });

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

        update: function (element, valueAccessor, allBindings, viewModel) {

            var value = ko.unwrap(valueAccessor());
            var projectOptions = value.projectOptions;
            var languageOptions = value.languageOptions;

            // to destroy typeaheads: $('.typeahead').typeahead('destroy');
            if (projectOptions.length > 0 && languageOptions.length > 0) {

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
                    }

                ).bind('typeahead:selected', value.select.bind(viewModel));
            } //end update
        } // end projectAutocomplete
    };
});
