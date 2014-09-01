/**
 * This module returns an instance of an object that knows how to get
 *   reports run by WikimetricsBot on wikimetrics.  Methods commented inline
 */
define(['config', 'uri/URI', 'uri/URITemplate'], function (siteConfig, uri) {
    'use strict';

    function WikimetricsApi(config) {
        this.root = config.wikimetricsDomain;
        this.projectOptions = [];
        this.languageOptions = [];
        /** project selection present upon bootstrap **/
        this.defaultProjects = [];
        this.urlProjectLanguageChoices = config.urlProjectLanguageChoices;
        this.categorizedMetricsUrl = config.categorizedMetricsUrl;

        /** Given a project returns language and project friendly names*/
        this.reverseLookup = {};
    }


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

    /**
     * Parameters
     *   metric  : a Wikimetrics metric
     *   project : a Wiki project (English Wikipedia is 'enwiki', Commons is 'commonswiki', etc.)
     *
     * Returns
     *   a jquery promise that is fetching the correct URL for the parameters passed in
     */
    WikimetricsApi.prototype.get = function (metric, project) {
        var address = uri.expand('https://{root}/static/public/datafiles/{metric}/{project}.json', {
            root: this.root,
            metric: metric,
            project: project,
        }).toString();
        return $.get(address);
    };

    /**
     * Retrieves the static list of projects and languages for which we support metrics
     * Options do not change once retrieved so we only retrieve them at most once
     **/
    WikimetricsApi.prototype.getProjectAndLanguageChoices = function (callback) {
        var map = Array.prototype.map;

        if (this.languageOptions.length <= 0) {
            this._getJSONConfig(this.urlProjectLanguageChoices, function (json) {
                var self = this;

                // keep track of the instances created to use the same objects later
                var saveProjects = {};
                var saveLanguages = {};

                self.defaultProjects = json.defaultProjects;
                self.prettyProjectNames = json.prettyProjectNames;

                self.projectOptions = map.call(json.projects, function (data) {
                    var project = new ProjectOption(data, self.prettyProjectNames);
                    saveProjects[data.name] = project;
                    return project;
                });

                self.languageOptions = map.call(json.languages, function (data) {
                    var language = new LanguageOption(data);
                    saveLanguages[data.name] = language;
                    return language;
                });

                self.reverseLookup = {};
                Object.getOwnPropertyNames(json.reverse).forEach(function (code) {
                    var combined = json.reverse[code];
                    self.reverseLookup[code] = combined;
                });

                callback();

            }.bind(this));
        }
    };

    WikimetricsApi.prototype._getJSONConfig = function (url, callback) {
        // callback should execute callback(json)
        $.ajax({
            dataType: 'json',
            url: url,
            success: callback
        });
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
    WikimetricsApi.prototype.getCategorizedMetrics = function (callback) {
        return $.get(this.categorizedMetricsUrl).done(callback);
    };

    return new WikimetricsApi(siteConfig);
});
