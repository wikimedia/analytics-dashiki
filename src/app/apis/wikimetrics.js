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
        this.urlProjectLanguageChoices = config.urlProjectLanguageChoices;

    }


    function ProjectOption(data) {
        // no need for these to be observables as they are fixed values
        this.name = data.name;
        this.languages = data.languages;
        this.description = data.description;
    }

    function LanguageOption(data) {
        // no need for these to be observables as they are fixed values
        this.name = data.name;
        this.projects = data.projects;
        this.description = data.description;
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
     * Options do not change once retrieved so we only retrieve them ad most once
     * Choices are of this form:
     *  [{
        "name": "English",
        "description": "All projects",
        "projects": {
            "Wikipedia": "eswiki",
            "Somethingwiki": "somewiki",
            "Wikidictionary": "somewiki"
        },...
        }], [{
            "name": "Wikitionary",
            "description": "170 languages",
             "languages": {
                "Spanish": "eswiki",
                "English": "enwiki",
                "German": "dewiki"
                }
            },...

        }]
     **/
    WikimetricsApi.prototype.getProjectAndLanguageChoices = function (callback) {
        var map = Array.prototype.map;

        if (this.languageOptions.length <= 0) {
            this._getJSONConfig(this.urlProjectLanguageChoices, function (json) {
                this.projectOptions = map.call(json[1], function (data) {
                    return new ProjectOption(data);
                });
                this.languageOptions = map.call(json[0], function (data) {
                    return new LanguageOption(data);
                });
                callback();

            }.bind(this));
        }
    }

    WikimetricsApi.prototype._getJSONConfig = function (url, callback) {
        // callback should execute callback(json)
        $.ajax({
            dataType: 'json',
            url: url,
            success: callback
        });


    };

    return new WikimetricsApi(siteConfig);
});
