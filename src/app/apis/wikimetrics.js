/**
 * This module returns an instance of an object that knows how to get
 *   reports run by WikimetricsBot on wikimetrics.  Methods commented inline
 */
define(['config', 'uri/URI', 'uri/URITemplate'], function (siteConfig, uri) {
    'use strict';

    function WikimetricsApi(config) {
        $.extend(this, config);
        this.root = config.wikimetricsDomain;
    }

    // only fetch certain things once per app life and keep their promise
    var promiseDefaults,
        promiseMetrics,
        promiseLanguagesAndProjects;


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
    WikimetricsApi.prototype.getData = function (metric, project) {

        var address = uri.expand('https://{root}/static/public/datafiles/{metric}/{project}.json', {
            root: this.root,
            metric: metric,
            project: project,
        }).toString();

        return this._getJSON(address);
    };

    /**
     * Retrieves the static list of projects and languages for which we support metrics
     * Options do not change once retrieved so we only retrieve them at most once
     **/
    WikimetricsApi.prototype.getProjectAndLanguageChoices = function (callback) {

        if (!promiseLanguagesAndProjects) {
            promiseLanguagesAndProjects = this._getJSON(this.urlProjectLanguageChoices)
                .pipe(function (json) {
                    var map = Array.prototype.map;
                    var self = this;

                    self.defaultProjects = json.defaultProjects;
                    self.prettyProjectNames = json.prettyProjectNames;
                    self.reverseLookup = json.reverse;

                    self.projectOptions = map.call(json.projects, function (data) {
                        return new ProjectOption(data, self.prettyProjectNames);
                    });

                    self.languageOptions = map.call(json.languages, function (data) {
                        return new LanguageOption(data);
                    });

                    return self;
                }.bind(this));
        }

        return promiseLanguagesAndProjects.done(callback);
    };

    /**
     * Retrieves the default selections for metrics and projects
     **/
    WikimetricsApi.prototype.getDefaultDashboard = function (callback) {

        if (!promiseDefaults) {
            promiseDefaults = this._getJSON(this.urlDefaultDashboard);
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
    WikimetricsApi.prototype.getCategorizedMetrics = function (callback) {

        if (!promiseMetrics) {
            promiseMetrics = this._getJSON(this.urlCategorizedMetrics);
        }
        return promiseMetrics.done(callback);
    };

    /**
     * Returns
     *   a promise to the url passed in
     **/
    WikimetricsApi.prototype._getJSON = function (url) {
        return $.ajax({
            dataType: 'json',
            url: url
        });
    };

    return new WikimetricsApi(siteConfig);
});
