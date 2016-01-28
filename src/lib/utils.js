/**
 * Look into doing this with Lodash if we can make a slim enough build
 **/
define(function (require) {
    'use strict';

    var moment = require('moment');

    require('twix');

    var utils = {
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

        formatDate: function (d) {
            return d ? moment(d).format('YYYY-MM-DD') : '(invalid)';
        },

        /**
         * Returns an array with "n" undefined values
         */
        filler: function (n) {
            var empty = [];
            empty.length = n;
            return Array.apply(null, empty);
        },

        /**
         * Poor man's category10 scale from d3, for when you don't want to
         * import the whole library for a simple color scale
         */
        category10: function (domain, range) {
            range = range || [
                '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
                '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
            ];
            domain = domain || [];
            return function (x) {

                var index = domain.indexOf(x);
                if (index < 0) {
                    index = domain.push(x) - 1;
                }

                return range[index % range.length];
            };
        },
    };
    return utils;
});
