'use strict';
define(function () {

    return {
        sortByName: function (a, b) {
            // NOTE: this purposefully sorts uppercase before lowercase
            return a.name === b.name ?
                0 : a.name > b.name ? 1 : -1;
        },
        sortByNameIgnoreCase: function (a, b) {
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        },

        /**
         * Returns an array with "n" undefined values
         */
        filler: function (n) {
            var empty = [];
            empty.length = n;
            return Array.apply(null, empty);
        },
    };
});
