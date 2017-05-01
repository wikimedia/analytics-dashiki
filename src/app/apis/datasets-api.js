/**
 * Retrieves flat files from datasets.wikimedia.org
 *   (this url is configurable but unlikely to change)
 */
'use strict';
define(function (require) {

    var siteConfig = require('config'),
        converterFinder = require('finders.converter'),
        TimeseriesData = require('models.timeseries'),
         _ = require('lodash'),
        uri = require('uri/URI'),
        logger = require('logger');

    require('uri/URITemplate');


    function DatasetsApi(config) {
        this.root = config.datasetsApi.endpoint;
        this.config = config.datasetsApi;
        this.dataConverter = converterFinder(config.datasetsApi.format);
    }


    /**
     * Fetch and parse a dataset.  Parameters will be used
     *
     * Parameters
     *      metric      : the name of something to measure
     *      submetric   : subcategory being measured
     *      project     : An array of project db names: [enwiki, dewiki]
     */
    DatasetsApi.prototype.getData = function (metricInfo, projects) {


        var deferred = $.Deferred(),
            address = '',
            self = this,
            timeseries = [];

        if (!Array.isArray(projects)) {
            projects = [projects];
        }


        var promises  = projects.map(function(_project) {

            if (metricInfo.metric) {
                address = self.root + uri.expand('/{metric}/{submetric}/{project}.{format}', {
                metric: metricInfo.metric,
                submetric: metricInfo.submetric,
                project: _project,
                format: self.config.format,
                }).toString();
            } else if (metricInfo.path) {
                address = uri(self.root + '/' + metricInfo.path).normalize().toString();
            }

            metricInfo.downloadLink = address;

            return $.ajax({ url: address});

        });


        $.when.apply($,promises).then(function(){
            var timeseriesData = _.flatten(arguments);

             for (var i =0;i<timeseriesData.length;i++) {
                var tdata = timeseriesData[i];
                var opt = {
                    label: metricInfo.submetric,
                    varyColors: true,
                    doNotParse: metricInfo.doNotParse,
                };

                timeseries.push(self.dataConverter(opt, tdata));
            }

            var data = TimeseriesData.mergeAll(timeseries);

            return deferred.resolve(data);

        }).catch(function(reason) {
            deferred.resolve(new TimeseriesData());
            logger.error(reason);
        });

        return deferred.promise();

    };

    return new DatasetsApi(siteConfig);
});
