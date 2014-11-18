/**
 * Static configuration object
 */
define([], function () {
    'use strict';

    return {

        // Temporarily we are getting config from wikimetrics
        // but the confiApi will be switched to mediawiki in the future
        configApi: {
            endpoint: 'metrics-staging.wmflabs.org',
            urlCategorizedMetrics: 'https://metrics-staging.wmflabs.org/static/public/datafiles/available-metrics.json',
            //using stubs to iron any blockers with pageviews
            //urlCategorizedMetrics: 'https://metrics.wmflabs.org/static/public/datafiles/available-metrics.json',
            urlDefaultDashboard: 'https://metrics.wmflabs.org/static/public/datafiles/defaultDashboard.json'
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
            endpoint: 'metrics-staging.wmflabs.org', // needs to support https
            format: 'csv'

        },


        //urlProjectLanguageChoices: '/stubs/fake-wikimetrics/projectLanguageChoices.json',
        //urlCategorizedMetrics: '/stubs/fake-wikimetrics/categorizedMetrics.json',
        //urlDefaultDashboard: '/stubs/fake-wikimetrics/defaultDashboard.json',
    };
});