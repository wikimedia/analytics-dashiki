/**
 * Static configuration object
 */
define([], function () {
    'use strict';

    return {
        wikimetricsDomain: 'metrics.wmflabs.org',
        //urlProjectLanguageChoices: 'https://metrics-staging.wmflabs.org/static/public/datafiles/available-projects.json',
        //urlCategorizedMetrics: 'https://metrics-staging.wmflabs.org/static/public/datafiles/available-metrics.json',
        urlProjectLanguageChoices: '/stubs/fake-wikimetrics/projectLanguageChoices.json',
        urlCategorizedMetrics: '/stubs/fake-wikimetrics/categorizedMetrics.json',
        urlDefaultDashboard: '/stubs/fake-wikimetrics/defaultDashboard.json',
    };
});
