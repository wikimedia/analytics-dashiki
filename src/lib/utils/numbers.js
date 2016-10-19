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
                // thousands / millions / billions formatter
                'kmb': '0.0a',
            };

            numeralFormatter = niceNames[numeralFormatter] || numeralFormatter;

            return function (n) {
                if (typeof n === 'string') {
                    return n;
                }
                if(!numeralFormatter) {
                    numeralFormatter = n <= 1 ? '0.0%' : '0.0a';
                }
                return numeral(n).format(numeralFormatter);
            };
        },
    };
});
