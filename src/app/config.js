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
        //totally fake for now
        urlProjectLanguageChoices: '../../stubs/fake-wikimetrics/projectLanguageChoices.json'

    };
});
