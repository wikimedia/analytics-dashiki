/**
 * This module returns an instance of an object that knows how to
 * Talk to the configurationAPI.
 *
 * Configuration files now reside in mediawiki.
 * To get them, this module uses mediawiki-storage library.
 */
define(function (require) {
    'use strict';

    var siteConfig = require('config'),
        mediawikiStorage = require('mediawiki-storage');

    function ConfigApi(config) {
        this.config = config.configApi;
    }

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
    ConfigApi.prototype.getDefaultDashboard = function (callback, layout) {

        // The dashboard page can either be injected by the build or must be a default
        var dashboardPage =
            this.config.dashboardPage ||
            this.config.defaultDashboardPageRoot +
            (layout ? '/' + layout : '');

        // NOTE: don't cache these promises, it makes tests much harder
        // Instead, rely on cache headers being set up properly
        return mediawikiStorage.get({
            host: this.config.endpoint,
            pageName: dashboardPage,
        }).done(callback);
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

        // NOTE: don't cache these promises, it makes tests much harder
        // Instead, rely on cache headers being set up properly
        mediawikiStorage.get({
            host: this.config.endpoint,
            pageName: this.config.categorizedMetricsPage
        }).done(callback);
    };

    /**
     * Retrieves the out of service configuration
     * This configuration is shared across all dashboards
     **/
    ConfigApi.prototype.getOutOfService = function (callback) {

        mediawikiStorage.get({
            host: this.config.endpoint,
            pageName: this.config.outOfService
        }).done(callback);
    };

    return new ConfigApi(siteConfig);
});