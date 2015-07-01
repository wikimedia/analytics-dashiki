/**
 * Retrieves the pageview counts per project from the files produced by webstatscollector
 * and hive/oozie according to our legacy pageview definition for now.
 *
 * Please note that as long as data abides to this format dashiki
 * can retrieve pageview counts from anywhere.
 */
define(function (require) {
    'use strict';

    var siteConfig = require('config'),
        dataConverterFactory = require('dataConverterFactory'),
        uri = require('uri/URI'),
        logger = require('logger');

    require('uri/URITemplate');

    function PageviewApi(config) {
        this.root = config.pageviewApi.endpoint;
        this.config = config;
        // note that dataConverter is a function that will need
        // to be executed in the context of the metric
        this.dataConverter = dataConverterFactory.getDataConverter(config.pageviewApi.format);
    }

    /**
     * Parameters
     *   metric         : an object representing a metric
     *   project        : a Wiki project database name (enwiki, commonswiki, etc.)     *
     *   showBreakdown  : whether to materialize breakdowns
     * Returns
     *  A promise with that wraps data for the metric/project transformed via the converter
     */
    PageviewApi.prototype.getData = function (metric, project, showBreakdown) {
        var deferred = new $.Deferred();

        //using christian's endpoint
        //  http://quelltextlich.at/wmf/projectcounts/daily/enwiki.csv
        var address = uri.expand('https://{root}/static/public/datafiles/{metric}/{project}.csv', {
            root: this.root,
            metric: metric.name,
            project: project
        }).toString();

        $.ajax({
            //let jquery decide datatype, otherwise things do not work when retrieving cvs
            url: address
        }).done(function (data) {
            var converter = this.getDataConverter(),
                opt = {
                    label: project,
                    allColumns: showBreakdown,
                    varyColors: false,
                    varyPatterns: true,
                    globalPattern: false,
                    startDate: '2014-01-01'
                };

            deferred.resolve(converter(opt, data));
        }.bind(this))
        .fail(function (error) {
            // resolve as done with empty results and log the error
            // to avoid crashing the ui when a metric has problems
            deferred.resolve([]);
            logger.error(error);
        });

        return deferred.promise();
    };

    PageviewApi.prototype.getDataConverter = function () {
        return this.dataConverter;
    };

    return new PageviewApi(siteConfig);
});
