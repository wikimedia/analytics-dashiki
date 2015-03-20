/**
 * Look into doing this with Lodash if we can make a slim enough build
 **/
define(function (require) {
    'use strict';

    var moment = require('moment');
    require('twix');

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
        },
        /**
         * Using a sample string, returns a function that can parse
         * similar values.  Falls back to the identity function.
         */
        parserFromSample: function (sample) {
            // NOTE: Dates in YYYYMMDD format will parse incorrectly, please use
            //       YYYY-MM-DD (with your choice of separator)
            if (!isNaN(parseFloat(sample)) && isFinite(sample)) {
                return function (x) { return parseFloat(x); };
            }
            if (moment(sample).isValid()) {
                return function (x) { return moment(x).toDate(); };
            }
            // If the sample contains null values,
            // the default parser tries to cast to float.
            return function (x) { return parseFloat(x) || x; };
        },

        timespan: function (a, b) {
            return moment(a).twix(b, {allDay: true}).format();
        },
    };
});
