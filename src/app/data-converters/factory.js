'use strict';

/**
 * A simple factory that determines what converter is needed based on
 *   different inputs
 */
define(function (require) {

    var separatedValues = require('converters.separated-values'),
        wikimetricsTimeseries = require('converters.wikimetrics-timeseries'),
        buildHierarchy = require('converters.hierarchy-data'),
        aqsApiResponse = require('converters.aqs-api-response');

    function ConverterFactory() {
        return;
    }

    /**
     * Based on format determine an appropriate converter and return it
     * Note that converters are returned as functions that execute taking rawdata
     * as an argument.
     *
     * Parameters
     *  format: enum - (tsv, cvs, json)
     *  valueField: string - The field in the results that contains the values.
     *                       For now only used in the AQS.
     */
    ConverterFactory.prototype.getDataConverter = function (format, valueField) {

        // note that the data converter modules return a function

        switch (format) {
        case 'tsv':
            return separatedValues('\t');

        case 'csv':
            return separatedValues(',');

        case 'json':
            return wikimetricsTimeseries();

        case 'aqs-api-response':
            return aqsApiResponse(valueField);

        case 'hierarchy':
            return buildHierarchy;

        }
    };

    return new ConverterFactory();
});
