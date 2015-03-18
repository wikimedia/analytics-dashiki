/**
 * Look into doing this with Lodash if we can make a slim enough build
 **/
define([], function () {
    'use strict';

    return {
        sortByName: function (a, b) {
            // NOTE: this purposefully sorts uppercase before lowercase
            return a.name === b.name ?
                0 : a.name > b.name ? 1 : -1;
        },
        sortByNameIgnoreCase: function (a, b) {
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        },
        getBounds: function (element, parentSelector) {
            var container = $(element).parents(parentSelector);

            return {
                width: container.innerWidth() || 0,
                height: container.innerHeight() || 0,
            };
        }
    };
});

