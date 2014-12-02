/**
 * This module returns an instance of an object that knows how to
 * Talk to the configurationAPI.
 *
 * Configuration files now reside in mediawiki.
 * To get them, this module uses mediawiki-storage library.
 */
define(['config', 'mediawiki-storage'], function (siteConfig, mediawikiStorage) {
    'use strict';

    function ConfigApi(config) {
        this.config = config.configApi;
    }

    // only fetch certain things once per app life and keep their promise
    var promiseDefaults,
        promiseMetrics;

    /**
     * Retrieves the default selections for metrics and projects
     *
     * Parameters
     *   callback : a function to pass returned data to
     *              (note you can just pass an observable here)
     *
     * Returns
     *   a jquery promise to the default project and metric config
     **/
    ConfigApi.prototype.getDefaultDashboard = function (callback) {

        if (!promiseDefaults) {
            promiseDefaults = mediawikiStorage.get({
                host: this.config.endpoint,
                pageName: this.config.defaultDashboardPage
            });
        }
        return promiseDefaults.done(callback);
    };

    /**
     * Retrieves the available metrics configuration
     *
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
            promiseMetrics = mediawikiStorage.get({
                host: this.config.endpoint,
                pageName: this.config.categorizedMetricsPage
            });
        }
        return promiseMetrics.done(callback);
    };

    return new ConfigApi(siteConfig);
});
