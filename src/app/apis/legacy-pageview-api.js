/**
 * Retrieves the pageview counts per project from the files produced by webstatscollector
 * and hive/oozie according to our legacy pageview definition for now.
 *
 * Please note that as long as data abides to this format dashiki
 * can retrieve pageview counts from anywhere.
 */
define(['config', 'dataConverterFactory', 'uri/URI', 'uri/URITemplate'], function (siteConfig, dataConverterFactory, uri) {
    'use strict';

    function PageviewApi(config) {
        this.root = config.pageviewApi.endpoint;
        this.config = config;
        // note that dataConverter is a function that will need
        // to be executed in the context of the metric
        this.dataConverter = dataConverterFactory.getDataConverter(config.pageviewApi.format);
    }

    /**
     * Returns
     *   a promise to the url passed in
     **/
    PageviewApi.prototype._getData = function (url) {
        return $.ajax({
            //let jquery decide datatype, otherwise things do not work when retrieving cvs
            url: url
        });
    };
    /**
     * Parameters
     *   metric  : an object representing  metric
     *   project : a Wiki project (English Wikipedia is 'enwiki', Commons is 'commonswiki', etc.)
     *
     * Returns
     *  A promise with that wraps data for the metric/project transformed via the converter
     */
    PageviewApi.prototype.getData = function (metric, project) {

        var metricName = metric.name;

        //using christian's endpoint
        //  http://quelltextlich.at/wmf/projectcounts/daily/enwiki.csv
        var address = uri.expand('http://{root}/wmf/projectcounts/daily/{project}.csv', {
            root: this.root,
            //  metric: metricName,
            project: project
        }).toString();

        var opt = {
            label: project
        };


        var converter = this.getDataConverter().bind(null, opt);

        return this._getData(address).then(converter);
    };

    PageviewApi.prototype.getDataConverter = function () {
        return this.dataConverter;
    };

    return new PageviewApi(siteConfig);
});