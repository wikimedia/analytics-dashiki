/**
 * Static configuration object
 */
define([], function () {
    'use strict';

    return {
        wikimetricsDomain: 'metrics-staging.wmflabs.org',
        wikimetricsDefaultSubmetrics: {
            NewlyRegistered: 'newly_registered',
            RollingActiveEditor: 'rolling_active_editor',
            PagesCreated: 'pages_created',
            NamespaceEdits: 'edits'
        },
        urlProjectLanguageChoices: '/stubs/fake-wikimetrics/projectLanguageChoices.json',
        categorizedMetricsUrl: '/stubs/categorizedMetrics.json',
    };
});
