/**
 * This module returns an instance of an object that knows how to
 * Talk to the configurationAPI.
 *
 * Configuration files now reside in wikimetrics but we are planning to move them
 * to mediawiki.
 * Encapsulating configuration requests on this object separates the wikimetricsAPI
 * as a data provider and the wikimetricsAPI as a (temporary) config provider.
 */
define(['config'], function (siteConfig) {
    'use strict';

    function ConfigApi(config) {
        this.root = config.configApi.endpoint;
        this.config = config;
    }

    // only fetch certain things once per app life and keep their promise
    var promiseDefaults,
        promiseMetrics;

    /**
     * Retrieves the default selections for metrics and projects
     **/
    ConfigApi.prototype.getDefaultDashboard = function (callback) {

        if (!promiseDefaults) {
            promiseDefaults = this._getJSON(this.config.configApi.urlDefaultDashboard);
        }
        return promiseDefaults.done(callback);
    };

    /**
     * Parameters
     *   callback : a function to pass returned data to
     *              (note you can just pass an observable here)
     *
     * Returns
     *   a jquery promise to an array of available metrics, formatted like this:
     *
     *      {category: 'some category', name: 'some metric'}
     **/
    ConfigApi.prototype.getCategorizedMetrics = function (callback) {

        if (!promiseMetrics) {
            promiseMetrics = this._getJSON(this.config.configApi.urlCategorizedMetrics);
        }
        return promiseMetrics.done(callback);
    };

    /**
     * Returns
     *   a promise to the url passed in
     **/
    ConfigApi.prototype._getJSON = function (url) {
        return $.ajax({
            dataType: 'json',
            url: url
        });
    };

    return new ConfigApi(siteConfig);
});
