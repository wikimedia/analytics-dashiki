/**
 * This module returns an instance of an object that knows how to
 * Talk to the configurationAPI.
 *
 * Configuration files now reside in mediawiki.
 * To get them, this module uses mediawiki-storage library.
 */
'use strict';
define(function (require) {

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
        this.getConfig(dashboardPage, callback);

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
        this.getConfig(this.config.categorizedMetricsPage, callback);

    };

    /**
     * Retrieves the out of service configuration
     * This configuration is shared across all dashboards
     **/
    ConfigApi.prototype.getOutOfService = function (callback) {
        this.getConfig(this.config.outOfService, callback);
    };

    ConfigApi.prototype.getProjectAndLanguageChoices = function (callback) {
        return this.getConfig(this.config.projectLanguageChoices, function (configData) {
            var UI = _convertSiteMap(configData);
            //call back works on digested data
            callback(UI);
        });

    };

    /**
     * Converts the choices in languages and project in an object easily
     * parseable by the UI
     **/
    function _convertSiteMap(json) {

        function ProjectOption(data, prettyNames) {
            // no need for these to be observables as they are fixed values
            this.code = data.name;
            this.name = prettyNames && prettyNames[data.name] ? prettyNames[data.name] : data.name;
            this.languages = data.languages;
            this.description = data.description;
        }

        function LanguageOption(data) {
            // no need for these to be observables as they are fixed values
            this.name = data.name;
            this.projects = data.projects;
            this.description = data.description;
            this.shortName = data.shortName;
        }

        function ProjectLanguage(data) {
            this.database = data.database;
            this.project = data.project;
            this.language = data.language;
        }

        var map = Array.prototype.map;
        var databases = Object.getOwnPropertyNames(json.reverse);
        var projectOptions = {},
            languageOptions = {};

        // this builds an object intended for the UI dropdown
        // menu object
        var options = {
            projectOptions: {},
            languageOptions: {},
            reverseLookup: {}
        };

        // keep track of objects created below so we can make the reverse
        // lookup a unified object with minimal memory footprint.  Ultimately,
        // grouping by languages and projects may be useful, enwiki may
        // inherit color shades from the wiki project or english language, etc

        options.projectOptions = map.call(json.projects, function (data) {
            var option = new ProjectOption(data, json.prettyProjectNames);
            projectOptions[option.code] = option;
            return option;
        });

        options.languageOptions = map.call(json.languages, function (data) {
            var option = new LanguageOption(data);
            languageOptions[option.name] = option;
            return option;
        });


        databases.forEach(function (database) {
            var reverse = json.reverse[database];
            options.reverseLookup[database] = new ProjectLanguage({
                database: database,
                project: projectOptions[reverse.project],
                language: languageOptions[reverse.language],
            });
        });

        return options;
    }

    ConfigApi.prototype.getConfig = function (pageName, callback) {
        return mediawikiStorage.get({
            host: this.config.endpoint,
            pageName: pageName
        }).done(callback);
    };

    return new ConfigApi(siteConfig);
});
