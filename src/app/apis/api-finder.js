/**
 * Defines a function that can find an api from a metric object
 *
 * Parameters
 *      metric  : an object that must define a string property called "api"
 *                which will be used to find an api instance that can retrieve
 *                data for that metric.  metric.api defaults to wikimetrics
 */
define(function (require) {
    'use strict';

    var wikimetricsApi = require('apis.wikimetrics'),
        aqsApi = require('apis.aqs'),
        datasetsApi = require('apis.datasets');

    /* matches metric.api to an api instance */
    return function (metric) {
        var mapping = {
            wikimetrics: wikimetricsApi,
            aqsApi: aqsApi,
            pageviewApi: aqsApi,
            datasets: datasetsApi,
        };

        return mapping[metric.api || 'wikimetrics'];
    };
});
