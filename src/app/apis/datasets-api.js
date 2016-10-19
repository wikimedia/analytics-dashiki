/**
 * Retrieves flat files from datasets.wikimedia.org
 *   (this url is configurable but unlikely to change)
 */
define(function (require) {
    'use strict';

    var siteConfig = require('config'),
        converterFinder = require('finders.converter'),
        TimeseriesData = require('models.timeseries'),
        uri = require('uri/URI'),
        logger = require('logger');

    require('uri/URITemplate');


    function DatasetsApi(config) {
        this.root = config.datasetsApi.endpoint;
        this.config = config.datasetsApi;
    }

    /**
     * Fetch and parse a dataset.  Parameters will be used
     *
     * Parameters
     *      metric      : the name of something to measure
     *      submetric   : subcategory being measured
     *      project     : database name (enwiki, wikidata, etc.)
     */
    DatasetsApi.prototype.getData = function (metricInfo, project) {
        var deferred = new $.Deferred(),
            address = '',
            converter = converterFinder(this.config.format),
            handleFailure = function (error) {
                // resolve as done with empty results and log the error
                // to avoid crashing the ui when a metric has problems
                deferred.resolve(new TimeseriesData([]));
                logger.error(error);
            };

        if (metricInfo.metric) {
            address = this.root + uri.expand('/{metric}/{submetric}/{project}.{format}', {
                metric: metricInfo.metric,
                submetric: metricInfo.submetric,
                project: project,
                format: this.config.format,
            }).toString();
        } else if (metricInfo.path) {
            address = uri(this.root + '/' + metricInfo.path).normalize().toString();
        } else {
            handleFailure('When calling getData, the metricInfo parameter needs either a metric/submetric or a path');
            return deferred.promise();
        }

        $.ajax({
            url: address
        }).done(function (data) {
            var opt = {
                    label: metricInfo.submetric,
                    varyColors: true,
                    doNotParse: metricInfo.doNotParse,
                };

            deferred.resolve(converter(opt, data));

        }).fail(handleFailure);

        // add the address fetched to the metricInfo, so clients can use it
        metricInfo.downloadLink = address;

        return deferred.promise();
    };

    return new DatasetsApi(siteConfig);
});
