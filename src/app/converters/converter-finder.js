'use strict';
/**
 * Find what converter is needed based on format
 */
define(function (require) {

    var separatedValues = require('converters.separated-values'),
        wikimetricsTimeseries = require('converters.wikimetrics-timeseries'),
        buildHierarchy = require('converters.hierarchy-data'),
        aqsApiResponse = require('converters.aqs-api-response'),
        annotationsData = require('converters.annotations');

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
                return separatedValues('\t');

            case 'csv':
                return separatedValues(',');

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
