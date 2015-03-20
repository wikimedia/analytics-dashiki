/**
 * Retrieves flat files from datasets.wikimedia.org
 *   (this url is configurable but unlikely to change)
 */
define(function (require) {
    'use strict';

    var siteConfig = require('config'),
        simpleSeparated = require('app/data-converters/simple-separated-values'),
        uri = require('uri/URI');

    require('uri/URITemplate');
    require('logger');


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
    DatasetsApi.prototype.getData = function (metric, submetric, project) {
        var deferred = $.Deferred(),
            address = this.root + uri.expand('/{metric}/{submetric}/{project}.{format}', {
                metric: metric,
                submetric: submetric,
                project: project,
                format: this.config.format,
            }).toString();

        $.ajax({
            url: address
        }).done(function (data) {
            var converter = simpleSeparated(this.config.format),
                opt = {
                    label: submetric,
                };

            deferred.resolve(converter(opt, data));
        }.bind(this)).fail(function (error) {
            // resolve as done with empty results and log the error
            // to avoid crashing the ui when a metric has problems
            deferred.resolve([]);
            logger.error(error);
        });

        return deferred.promise();
    };

    return new DatasetsApi(siteConfig);
});
