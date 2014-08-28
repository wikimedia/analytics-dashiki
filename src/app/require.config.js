/* jshint -W098 */
/* jshint -W079 */
'use strict';
// require.js looks for the following global when initializing
var require = {
    baseUrl: '.',
    paths: {
        'jquery': 'bower_modules/jquery/dist/jquery',
        'knockout': 'bower_modules/knockout/dist/knockout',
        'knockout-projections': 'bower_modules/knockout-projections/dist/knockout-projections',
        'text': 'bower_modules/requirejs-text/text',
        'd3': 'bower_modules/d3/d3',
        'vega': 'bower_modules/vega/vega',
        'topojson': 'bower_modules/topojson/topojson',
        'moment': 'bower_modules/moment/moment',
        // NOTE: if you want functions like uri.expand, you must include both
        // URI and URITemplate like define(['uri/URI', 'uri/URITemplate'] ...
        // because URITemplate modifies URI when it's parsed
        'uri': 'bower_modules/URIjs/src',
        'config': 'app/config',
        'logger': 'lib/logger',
        'wikimetricsApi': 'app/apis/wikimetrics',
        'typeahead': 'bower_modules/typeahead.js/dist/typeahead.bundle',
        'ajaxWrapper': 'lib/ajaxWrapper'
    },
    shim: {
        'ajaxWrapper': {
            //These script dependencies should be loaded before loading
            //ajaxWrapper.js
            deps: ['jquery']
        },
        'typeahead': {
            //These script dependencies should be loaded before loading
            //typeahead
            deps: ['jquery']
        }
    }

    // TODO: figure out cache busting.  This causes errors in testing:
    // urlArgs: 'bust=' +  (new Date()).getTime()
};
