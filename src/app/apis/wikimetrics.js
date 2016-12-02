/**
 * This module returns an instance of an object that knows how to get
 * reports run by WikimetricsBot on wikimetrics.  Methods commented inline
 */
'use strict';
define(function (require) {

    var siteConfig = require('config'),
        configApi = require('apis.config'),
        converterFinder = require('finders.converter'),
        uri = require('uri/URI'),
        TimeseriesData = require('models.timeseries');

    require('uri/URITemplate');
    require('logger');

    function WikimetricsApi(config) {
        this.root = config.wikimetricsApi.endpoint;
        this.config = config;
        // note that dataCoverter is a function that will need to be executed
        // in the context of the metric
        this.dataConverter = converterFinder(config.wikimetricsApi.format);
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
        var deferred = $.Deferred();

        var address = uri.expand('https://{root}/static/public/datafiles/{metric}/{project}.json', {
            root: this.root,
            metric: metric.name,
            project: project,
        }).toString();

        this._getJSON(address)
            .done(function (data) {
                var submetrics = {};

                submetrics[metric.name] = metric.submetric || metric.defaultSubmetric;
                var opt = {
                    defaultSubmetrics: submetrics
                };

                deferred.resolve(this.dataConverter(opt, data));
            }.bind(this))
            .fail(function (error) {
                // resolve as done with empty results and log the error
                // to avoid crashing the ui when a metric has problems
                deferred.resolve(new TimeseriesData());
                logger.error(error);
            });

        return deferred.promise();
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
