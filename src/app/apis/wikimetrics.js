/**
 * This module returns an instance of an object that knows how to get
 * reports run by WikimetricsBot on wikimetrics.  Methods commented inline
 */
'use strict';
define(function (require) {

    var siteConfig = require('config'),
        converterFinder = require('finders.converter'),
        uri = require('uri/URI'),
         _ = require('lodash'),
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
     *   metric: An object representing a Wikimetrics metric
     *   projects: An array of project db names: [enwiki, dewiki]
     *
     * Returns
     *  A promise with that wraps data for the metric/project transformed via the converter
     */
    WikimetricsApi.prototype.getData = function (metric, projects) {
        var deferred = $.Deferred(),
            self = this, timeseries = [];

        var promises  = projects.map(function(_project) {
            var address = uri.expand('https://{root}/static/public/datafiles/{metric}/{project}.json', {
            root: self.root,
            metric: metric.name,
            project: _project,
             }).toString();

            return self._getJSON(address);

        });

        $.when.apply($,promises).then(function(){

            var timeseriesData = _.flatten(arguments);

            for (var i =0;i<timeseriesData.length;i++) {
                var tdata = timeseriesData[i];
                                console.log(tdata);

                var submetrics = {};

                submetrics[metric.name] = metric.submetric || metric.defaultSubmetric;
                var opt = {
                        defaultSubmetrics: submetrics
                };

                timeseries.push(self.dataConverter(opt, tdata));

            }

            var data = TimeseriesData.mergeAll(timeseries);

            return deferred.resolve(data);
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
