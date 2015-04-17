/**
 * A simple factory that determines what converter is needed based on
 *   different inputs
 */
define(function (require) {
    'use strict';

    var separatedValues = require('converters.separated-values'),
        wikimetricsTimeseries = require('converters.wikimetrics-timeseries');

    function ConverterFactory() {
        return;
    }

    /**
     * Based on format determine an appropriate converter and return it
     * Note that converters are returned as functions that execute taking rawdata
     * as an argument.
     *
     * Parameters
     *  format: enum (tsv, cvs, json)
     */
    ConverterFactory.prototype.getDataConverter = function (format) {

        // note that the data converter modules return a function

        switch (format) {
        case 'tsv':
            return separatedValues('\t');

        case 'csv':
            return separatedValues(',');

        case 'json':
            return wikimetricsTimeseries();

        }
    };

    return new ConverterFactory();
});
