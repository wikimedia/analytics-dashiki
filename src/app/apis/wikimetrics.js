/**
 * This module returns an instance of an object that knows how to get
 * reports run by WikimetricsBot on wikimetrics.  Methods commented inline
 */
define(['config', 'dataConverterFactory', 'uri/URI', 'uri/URITemplate'], function (siteConfig, dataConverterFactory, uri) {
    'use strict';

    function WikimetricsApi(config) {
        this.root = config.wikimetricsApi.endpoint;
        this.config = config;
        // note that dataCoverter is a function that will need to be executed
        // in the context of the metric
        this.dataConverter = dataConverterFactory.getDataConverter(config.wikimetricsApi.format);
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

    function ProjectLanguage(data) {
        this.database = data.database;
        this.project = data.project;
        this.language = data.language;
    }

    /**
     * Parameters
     *   metric  : an object representing a Wikimetrics metric
     *   project : a Wiki project (English Wikipedia is 'enwiki', Commons is 'commonswiki', etc.)
     *
     * Returns
     *  A promise with that wraps data for the metric/project transformed via the converter
     */
    WikimetricsApi.prototype.getData = function (metric, project) {

        var metricName = metric.name;
        var address = uri.expand('https://{root}/static/public/datafiles/{metric}/{project}.json', {
            root: this.root,
            metric: metricName,
            project: project,
        }).toString();

        var submetrics = {};

        submetrics[metric.name] = metric.submetric || metric.defaultSubmetric;

        var opt = {
            defaultSubmetrics: submetrics
        };

        var converter = this.getDataConverter().bind(null, opt);

        return this._getJSON(address).then(converter);
    };

    /**
     * Retrieves the static list of projects and languages for which we support metrics
     * Options do not change once retrieved so we only retrieve them at most once
     **/
    WikimetricsApi.prototype.getProjectAndLanguageChoices = function (callback) {

        if (!promiseLanguagesAndProjects) {
            var url = this.config.wikimetricsApi.urlProjectLanguageChoices;
            promiseLanguagesAndProjects = this._getJSON(url)
                .pipe(function (json) {
                    var map = Array.prototype.map;
                    var self = this,
                        databases = Object.getOwnPropertyNames(json.reverse),
                        projectOptions = {},
                        languageOptions = {};

                    self.defaultProjects = json.defaultProjects;
                    self.reverseLookup = {};

                    // keep track of objects created below so we can make the reverse
                    // lookup a unified object with minimal memory footprint.  Ultimately,
                    // grouping by languages and projects may be useful, enwiki may
                    // inherit color shades from the wiki project or english language, etc

                    self.projectOptions = map.call(json.projects, function (data) {
                        var option = new ProjectOption(data, json.prettyProjectNames);
                        projectOptions[option.code] = option;
                        return option;
                    });

                    self.languageOptions = map.call(json.languages, function (data) {
                        var option = new LanguageOption(data);
                        languageOptions[option.name] = option;
                        return option;
                    });

                    databases.forEach(function (database) {
                        var reverse = json.reverse[database];
                        self.reverseLookup[database] = new ProjectLanguage({
                            database: database,
                            project: projectOptions[reverse.project],
                            language: languageOptions[reverse.language],
                        });
                    });

                    return self;
                }.bind(this));
        }

        return promiseLanguagesAndProjects.done(callback);
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

    WikimetricsApi.prototype.getDataConverter = function () {
        return this.dataConverter;
    };

    return new WikimetricsApi(siteConfig);
});