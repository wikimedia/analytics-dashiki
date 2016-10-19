'use strict';

/**
 * Retrieves pageview and unique devices counts from AQS.
 */
define(function (require) {

    var siteConfig = require('config'),
        converterFinder = require('finders.converter'),
        logger = require('logger'),
        moment = require('moment'),
        pageviews = require('pageviews'),
        _ = require('lodash'),
        TimeseriesData = require('models.timeseries'),
        sitematrix = require('sitematrix');

    require('uri/URITemplate');

    function AQSApi(config) {
        this.config = config;
        // Note that dataConverters are functions that will need
        // to be executed in the context of the metric.
        this.dataConverters = _.mapValues(config.aqsApi, function (apiConfig) {
            return converterFinder(
                'aqs-api-response',
                apiConfig.valueField
            );
        });
    }

    /**
     * Parameters
     *  metric         : An object representing a metric.
     *  project        : A Wiki project database name (enwiki, commonswiki, etc).
     *  accessMethods  : Access methods to split data by.
     * Returns
     *  A promise that wraps data for the metric/project transformed via the converter
     *  Mobile, desktop and app breakdowns translate to different requests.
     */
    AQSApi.prototype.getData = function (metric, project, accessMethods) {
        var deferred = new $.Deferred(),
            apiConfig = this.config.aqsApi[metric.name],
            converter = this.dataConverters[metric.name];

        if (!apiConfig) {
            deferred.resolve(new TimeseriesData());
            return deferred.promise();
        }

        // Normalize the access method breakdown.
        if (!accessMethods || !accessMethods.length) {
            accessMethods = ['All'];
        }
        accessMethods = _.map(accessMethods, function (method) {
            return apiConfig.breakdownOptions[method];
        });

        // Get the project URL with sitematrix.
        var sitematrixPromise = sitematrix.getProjectUrl(this.config, project);
        sitematrixPromise.done(function (projectUrl) {
            var promises = [],
                granularity = metric.granularity || 'daily',
                endDate = moment().format(apiConfig.dateFormat[granularity]),
                breakdownParameter = _.camelCase(apiConfig.breakdownParameter);

            // Perform the requests.
            _.forEach(accessMethods, function (method) {
                var params = {
                    project: projectUrl,
                    agent: 'user',  // Only used in the Pageviews endpoint.
                    granularity: granularity,
                    start: apiConfig.dataStart,
                    end: endDate
                };
                params[breakdownParameter] = method;
                promises.push(pageviews[apiConfig.endpoint](params));
            });

            // Return when we have all data.
            Promise.all(promises).then(function (data) {
                var timeseries = []
                    breakdownParameter = _.kebabCase(apiConfig.breakdownParameter);
                _.forEach(data, function (dataForMethod) {
                    // Use the dbname as the label, to match colors with Project Selector
                    // if we want to re-label, we need to change both.
                    var opt = {
                        label: project,
                        pattern: dataForMethod.items[0][breakdownParameter]
                    };
                    timeseries.push(converter(opt, dataForMethod));
                });

                // Datasets are disjoint but we need to add them so that
                // the timeseries object makes sense.
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

    return new AQSApi(siteConfig);
});
