'use strict';
define(function (require) {

    var numeral = require('numeral');

    return {

        /**
         * Get a number formatting function from a numeral.js format
         */
        numberFormatter: function (numeralFormatter) {
            var niceNames = {
                'percent': '0.0%',
                'kmb': '0.0a',
            };

            numeralFormatter = niceNames[numeralFormatter] || numeralFormatter;

            return function (n) {
                return numeral(n).format(numeralFormatter);
            };
        },
    };
});
