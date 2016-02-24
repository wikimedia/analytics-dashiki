/**
 * Retrieves the pageview counts from pageview API
 */
define(function (require) {
    'use strict';

    var siteConfig = require('config'),
        dataConverterFactory = require('dataConverterFactory'),
        logger = require('logger'),
        moment = require('moment'),
        pageviews = require('pageviews'),
        config = require('config'),
        _ = require('lodash'),

        TimeseriesData = require('converters.timeseries'),
        sitematrix = require('sitematrix');

    require('uri/URITemplate');

    function PageviewApi (conf) {
        this.root = conf.pageviewApi.endpoint;
        this.config = conf;
        // note that dataConverter is a function that will need
        // to be executed in the context of the metric
        this.dataConverter = dataConverterFactory.getDataConverter(config.pageviewApi.format);
    }

    /**
     * Parameters
     *   metric         : an object representing a metric
     *   project        : a Wiki project database name (enwiki, commonswiki, etc.)
     *  showBreakdown  : whether to split data by mobile/destop access
     * Returns
     *  A promise with that wraps data for the metric/project transformed via the converter
     *  Mobile and desktop breakdowns translate to two different requests to pageview api
     */
    PageviewApi.prototype.getData = function (metric, project, showBreakdown) {

        var deferred = new $.Deferred(),
            endDate = moment().format('YYYYMMDDHH'),
            accessMethods;

        if (showBreakdown) {
            accessMethods = ['all-access', 'desktop', 'mobile-web'];
        } else {
            accessMethods = ['all-access'];
        }

        var sitematrixPromise = sitematrix.getProjectUrl(config, project);
        sitematrixPromise.done(function (projectUrl) {

            var promises = [];

            _.forEach(accessMethods, function (method) {

                promises.push(pageviews.getAggregatedPageviews({
                    project: projectUrl,
                    agent: 'user',
                    granularity: 'daily',
                    access: method,
                    start: '2015010100',
                    end: endDate
                }));

            });

            //return when we have all data

            Promise.all(promises).then(function (data) {

                var converter = this.dataConverter,
                    timeseries = [];

                _.forEach(data, function (dataForMethod) {
                    // use the dbname as the label, to match colors with Project Selector
                    // if we want to re-label, we need to change both
                    var opt = {
                        label: project,
                        pattern: dataForMethod.items[0].access,
                    };

                    timeseries.push(converter(opt, dataForMethod));
                });
                // datasets are disjointed but we need to add them such the timeseries object makes sense
                deferred.resolve(timeseries);

            }.bind(this), function (reason) {
                deferred.resolve(new TimeseriesData());
                logger.error(reason);
            }).catch(function (error) {
                deferred.resolve(new TimeseriesData());
                logger.error(error);
            });

        }.bind(this));

        sitematrixPromise.fail(function () {
            //something went wrong, make sure to return empty data
            deferred.resolve(new TimeseriesData());
        });

        return deferred.promise();

    };


    PageviewApi.prototype.getDataConverter = function () {
        return this.dataConverter;
    };

    return new PageviewApi(siteConfig);
});
