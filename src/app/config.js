/**
 * Static configuration object
 */
define([], function () {
    'use strict';

    return {
        wikimetricsDomain: 'metrics.wmflabs.org',
        urlProjectLanguageChoices: 'https://metrics.wmflabs.org/static/public/datafiles/available-projects.json',
        urlCategorizedMetrics: 'https://metrics.wmflabs.org/static/public/datafiles/available-metrics.json',
        urlDefaultDashboard: 'https://metrics.wmflabs.org/static/public/datafiles/defaultDashboard.json'
        //urlProjectLanguageChoices: '/stubs/fake-wikimetrics/projectLanguageChoices.json',
        //urlCategorizedMetrics: '/stubs/fake-wikimetrics/categorizedMetrics.json',
        //urlDefaultDashboard: '/stubs/fake-wikimetrics/defaultDashboard.json',
    };
});
