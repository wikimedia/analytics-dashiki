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
            //https://meta.wikimedia.org/wiki/Dashiki:OutOfService
            outOfService: 'Dashiki:OutOfService'
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

        aqsApi: {
            'Pageviews': {
                endpoint: 'getAggregatedPageviews',
                valueField: 'views',
                dateFormat: {
                    'hourly': 'YYYYMMDDHH',
                    'daily': 'YYYYMMDD00',
                    'monthly': 'YYYYMM0100'
                },
                // Api knows how to translate from general breakdown
                // labels to api semantics to retrieve data.
                breakdownOptions: {
                    'All': 'all-access',
                    'Desktop site': 'desktop',
                    'Mobile site': 'mobile-web',
                    'Mobile App': 'mobile-app'
                },
                breakdownParameter: 'access',
                dataStart: '2015010100'
            },
            'UniqueDevices': {
                endpoint: 'getUniqueDevices',
                valueField: 'devices',
                dateFormat: {
                    'daily': 'YYYYMMDD',
                    'monthly': 'YYYYMM01'
                },
                // Api knows how to translate from general breakdown
                // labels to api semantics to retrieve data.
                breakdownOptions: {
                    'All': 'all-sites',
                    'Desktop site': 'desktop-site',
                    'Mobile site': 'mobile-site'
                },
                breakdownParameter: 'access-site',
                dataStart: '20160101'
            }
        },

        datasetsApi: {
            endpoint: 'https://datasets.wikimedia.org/limn-public-data/metrics',
            format: 'tsv'
        },

        // our sitematrix request should be cached for 1 hour
        sitematrix: {
            endpoint: 'https://meta.wikimedia.org/w/api.php?action=sitematrix&formatversion=2&format=json&maxage=3600&smaxage=3600'
        }
    };
});