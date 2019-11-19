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
        utils = require('utils.strings'),
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


        var self = this,
            deferred = $.Deferred(),
            address = '',
            promise,
            promises,
            opt = {
                label: metricInfo.submetric,
                varyColors: true,
                doNotParse: metricInfo.doNotParse,
            };

        if (!Array.isArray(projects)) {
            projects = [projects];
        }

        if (metricInfo.grouped) {
            metricInfo.address = self.root + uri.expand('/{metric}/{submetric}.{format}', {
                metric: metricInfo.metric,
                submetric: metricInfo.submetric,
                format: self.config.format,
            });

            promises = $.ajax({ url: metricInfo.address });

            promise = $.when(promises).then(function(text){
                var rows = utils.splitter(
                        text,
                        utils.separators.line,
                        utils.separators.value[self.config.format]
                    ),
                    timeseriesByProject;

                opt.alreadySplit = true;

                // skip the header
                rows.shift();
                // partition data by wiki column (has to be first column by convention)
                timeseriesByProject = rows.reduce(function(byProject, row) {
                    var wiki = row.shift();

                    if (projects.indexOf(wiki) >= 0) {

                        if (!byProject[wiki]) {
                            // first row is a header identifying this wiki so we can merge later
                            byProject[wiki] = [['date', wiki]];
                        }
                        byProject[wiki].push(row);
                    }

                    return byProject;
                }, {});

                return _.values(timeseriesByProject);
            });

        } else {
            promises = projects.map(function(_project) {

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

                // todo: this sideffect is ugly
                metricInfo.downloadLink = address;

                return $.ajax({ url: address });

            });

            promise = $.when.apply($, promises).then(function(){
                return _.flatten(arguments);
            });
        }

        promise.then(function(projectsData) {
            // each tdata has a header with the project (wiki) name
            var timeseries = projectsData.map(function(tdata) {
                // if grouped, opt was set to alreadyParsed, and tdata are rows
                // if not grouped, tdata is text
                return self.dataConverter(opt, tdata);
            });

            // the merge and color varying works because of the headers
            return deferred.resolve(TimeseriesData.mergeAll(timeseries));

        }).catch(function(reason) {
            deferred.resolve(new TimeseriesData());
            logger.error(reason);
        });

        return deferred.promise();

    };

    return new DatasetsApi(siteConfig);
});
