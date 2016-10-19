'use strict';
/**
 * Defines a function that can find an api from a metric object
 *
 * Parameters
 *      metric  : an object that must define a string property called "api"
 *                which will be used to find an api instance that can retrieve
 *                data for that metric.  metric.api defaults to wikimetrics
 */
define(function (require) {

    var wikimetricsApi = require('apis.wikimetrics'),
        aqsApi = require('apis.aqs'),
        datasetsApi = require('apis.datasets'),
        annotationsApi = require('apis.annotations'),
        configApi = require('apis.config');

    /* matches metric.api to an api instance */
    return function (metric) {
        var mapping = {
            annotations: annotationsApi,
            aqsApi: aqsApi,
            config: configApi,
            datasets: datasetsApi,
            pageviewApi: aqsApi,
            wikimetrics: wikimetricsApi,
        };

        return mapping[metric.api || 'wikimetrics'];
    };
});
