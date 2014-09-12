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
        }
    };
});

