'use strict';
/**
 * Static configuration object
 */
define(function (require) {

    // load any config files written by the build system
    var buildConfig = require('./config-from-build');

    return {

        // indicates which mediawiki host and pages contain the configuration
        configApi: {
            endpoint: 'meta.wikimedia.org',
            // next two fields are mediawiki page names
            categorizedMetricsPage: 'Dashiki:CategorizedMetrics',
            dashboardPage: buildConfig ? buildConfig.dashboardArticle : null,
            defaultDashboardPageRoot: 'Dashiki:DefaultDashboard',
        },

        // format are specified per API for now, in the future they can be specified per metric if needed
        // this means that formatters can also be a property of the API
        // this asumption makes code simpler for now
        wikimetricsApi: {
            endpoint: 'metrics.wmflabs.org',
            /** not sure if teh below url should also lawfully live on configAPI */
            urlProjectLanguageChoices: 'https://metrics.wmflabs.org/static/public/datafiles/available-projects.json',
            format: 'json'

        },

        //placeholder for now, note this is coming from a temporary domain
        pageviewApi: {
            endpoint: 'metrics.wmflabs.org', // needs to support https
            format: 'csv'

        },

        datasetsApi: {
            endpoint: '//datasets.wikimedia.org/limn-public-data/metrics',
            format: 'tsv'
        },
    };
});
