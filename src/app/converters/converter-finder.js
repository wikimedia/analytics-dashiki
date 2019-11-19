'use strict';
/**
 * Find what converter is needed based on format
 */
define(function (require) {

    var separatedValues = require('converters.separated-values'),
        wikimetricsTimeseries = require('converters.wikimetrics-timeseries'),
        buildHierarchy = require('converters.hierarchy-data'),
        aqsApiResponse = require('converters.aqs-api-response'),
        annotationsData = require('converters.annotations'),
        utils = require('utils.strings');

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
    return function (format, valueField) {

        // note that the data converter modules return a function

        switch (format) {
            case 'tsv':
                return separatedValues(utils.separators.value.tsv);

            case 'csv':
                return separatedValues(utils.separators.value.csv);

            case 'json':
                return wikimetricsTimeseries();

            case 'aqs-api-response':
                return aqsApiResponse(valueField);

            case 'hierarchy':
                return buildHierarchy;

            case 'annotations':
                return annotationsData();
        }
    };
});
