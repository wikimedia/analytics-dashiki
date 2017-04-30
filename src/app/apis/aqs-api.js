/**
 * Retrieves pageview and unique devices counts from AQS.
 */
'use strict';
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
    * Gets data from API
    **/
    function getData(metric, projects, accessMethods, config, apiConfig, converter) {
        var deferred = new $.Deferred(),
            reverseLookup = {},
            projectPromises = [];

        projectPromises = projects.map(function(_project){
            // mapping every project to a promise that returns a projectUrl
            return sitematrix.getProjectUrl(config, _project).done(function(projectUrl){
                reverseLookup[projectUrl] = _project;

            });
        });


        Promise.all(projectPromises).then(function (projectUrls) {

            var accessMethodsPromises = [],
                timeseries =[],
                granularity = metric.granularity || 'daily',
                endDate = moment().format(apiConfig.dateFormat[granularity]),
                breakdownCamelCase = _.camelCase(apiConfig.breakdownParameter),
                breakdownKebabCase = _.kebabCase(apiConfig.breakdownParameter);

                _.forEach(projectUrls, function(projectUrl) {

                    var promises = accessMethods.map(function(_accessMethod){
                        var params = {
                        project: projectUrl,
                        agent: 'user',  // Only used in the Pageviews endpoint.
                        granularity: granularity,
                        start: apiConfig.dataStart,
                        end: endDate
                        };
                        params[breakdownCamelCase] = _accessMethod;

                        // mapping every acess method per project to a
                        // promise that returns data for project/access method
                        // that is, a single http request
                        return pageviews[apiConfig.endpoint](params);

                    }); //end map

                    accessMethodsPromises = accessMethodsPromises.concat(promises);


                    //resolve data for 1 db
                    return Promise.all(promises).then(function (data) {

                        _.forEach(data, function (dataForMethod) {
                            // Use the dbname as the label, to match colors with Project Selector
                            // if we want to re-label, we need to change both.

                            var _project = reverseLookup[projectUrl];
                            var opt = {
                                label: _project,
                                pattern: dataForMethod.items[0][breakdownKebabCase]
                            };

                            timeseries.push(converter(opt, dataForMethod));
                        });

                    }).catch(function(reason) {
                        deferred.resolve(new TimeseriesData());
                        logger.error(reason);
                });


                }); // end foreach

            // all returned promises have filled in timeseries array
            return Promise.all(accessMethodsPromises).then(function () {

                // Datasets are disjoint but we need to add them so that
                // the timeseries object makes sense.
                var ts = TimeseriesData.mergeAll(timeseries);
                return  deferred.resolve(ts);

            }).catch(function(reason) {
                deferred.resolve(new TimeseriesData());
                logger.error(reason);
        });

        });

        return deferred.promise();
    }

    /**
     * Parameters
     *  metric         : An object representing a metric.
     *  projects       : An array of project db names: [enwiki, dewiki]
     *  accessMethods  : Access methods to split data by.
     * Returns
     *  A promise that wraps data for the metric/project transformed via the converter
     *  Mobile, desktop and app breakdowns translate to different requests.
     */
    AQSApi.prototype.getData = function (metric, projects, accessMethods) {

        var apiConfig = this.config.aqsApi[metric.name],
            converter = this.dataConverters[metric.name];

        if (!apiConfig) {
            var deferred = new $.Deferred();
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


        return getData(metric, projects, accessMethods, this.config, apiConfig, converter);
    };

    return new AQSApi(siteConfig);
});
