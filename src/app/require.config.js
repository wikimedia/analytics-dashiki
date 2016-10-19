'use strict';
// require.js looks for the following global when initializing
var require = {
    baseUrl: '/src',
    paths: {
        'jquery'                : 'bower_modules/jquery/dist/jquery',
        'lodash'                : 'bower_modules/lodash/main',
        // NOTE: the minified ko build is broken in 3.2.0
        // (Issue reported https://github.com/knockout/knockout/issues/1528)
        'knockout'              : 'bower_modules/knockout/dist/knockout.debug',
        'text'                  : 'bower_modules/requirejs-text/text',
        'numeral'               : 'bower_modules/numeral/numeral',
        'd3'                    : 'bower_modules/d3/d3',
        'vega'                  : 'bower_modules/vega/vega',
        'datepicker'            : 'bower_modules/semantic-datepicker/daterangepicker',
        'topojson'              : 'bower_modules/topojson/topojson',
        'moment'                : 'bower_modules/moment/moment',
        'semantic2-popup'       : 'bower_modules/semantic-2/dist/components/popup',
        'semantic2-dropdown'    : 'bower_modules/semantic-2/dist/components/dropdown',
        'semantic2-transition'  : 'bower_modules/semantic-2/dist/components/transition',
        'mediawiki-storage'     : 'bower_modules/mediawiki-storage/dist/mediawiki-storage',
        'marked'                : 'bower_modules/marked/lib/marked',
        'twix'                  : 'bower_modules/twix/dist/twix',
        'dygraphs'              : 'bower_modules/dygraphs/dygraph-combined',
        'nvd3'                  : 'bower_modules/nvd3/build/nv.d3',
        'rickshaw'              : 'bower_modules/rickshaw/rickshaw',
        'pageviews'             : 'bower_modules/pageviews/pageviews.min',
        // NOTE: if you want functions like uri.expand, you must include both
        // URI and URITemplate like define(['uri/URI', 'uri/URITemplate'] ...
        // because URITemplate modifies URI when it's parsed
        'uri'                   : 'bower_modules/URIjs/src',
        'typeahead'             : 'bower_modules/typeahead.js/dist/typeahead.bundle',

        // *** app
        'config'                : 'app/config',
        'sitematrix'            : 'app/sitematrix',

        // *** lib
        'lib.polyfills'         : 'lib/polyfills',
        'ajaxWrapper'           : 'lib/ajax-wrapper',
        'window'                : 'lib/window',
        'stateManager'          : 'lib/state-manager',
        'logger'                : 'lib/logger',

        // *** finders
        'finders.api'           : 'app/apis/api-finder',
        'finders.converter'     : 'app/converters/converter-finder',

        // *** apis
        'apis.wikimetrics'      : 'app/apis/wikimetrics',
        'apis.annotations'      : 'app/apis/annotations-api',
        'apis.aqs'              : 'app/apis/aqs-api',
        'apis.datasets'         : 'app/apis/datasets-api',
        'apis.config'           : 'app/apis/config-api',

        // *** converters
        'converters.hierarchy-data'         : 'app/converters/hierarchy/hierarchy-data',
        'converters.annotations'            : 'app/converters/timeseries/annotations-data',
        'converters.aqs-api-response'       : 'app/converters/timeseries/aqs-api-response',
        'converters.separated-values'       : 'app/converters/timeseries/separated-values',
        'converters.wikimetrics-timeseries' : 'app/converters/timeseries/wikimetrics-timeseries',

        // *** models
        'models.timeseries'         : 'app/models/timeseries-data',

        // *** knockout utils
        // custom bindings
        'knockout.datepicker'       : 'lib/knockout-utils/bindings/datepicker',
        'knockout.dropdown'         : 'lib/knockout-utils/bindings/dropdown',
        'knockout.popup'            : 'lib/knockout-utils/bindings/popup',
        'knockout.table'            : 'lib/knockout-utils/bindings/table',
        'knockout.toggle'           : 'lib/knockout-utils/bindings/toggle',
        // viewmodels
        'viewmodels.copy-params'    : 'lib/knockout-utils/viewmodels/copy-params',
        'viewmodels.single-select'  : 'lib/knockout-utils/viewmodels/single-select',
        // custom observables
        'observables.async'         : 'lib/knockout-utils/async-observables',

        // *** utils
        'utils.arrays'              : 'lib/utils/arrays',
        'utils.strings'             : 'lib/utils/strings',
        'utils.datetime'            : 'lib/utils/datetime',
        'utils.numbers'             : 'lib/utils/numbers',
        'utils.colors'              : 'lib/utils/colors',
        'utils.elements'            : 'lib/utils/elements',
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
        },
        d3: { exports: 'd3' },
        nvd3: {
            exports: 'nv',
            deps: ['d3']
        },
        'semantic2-popup': {
            deps: ['jquery']
        },
        pageviews: {exports:'pageviews'},
    }
};

if (typeof window === 'undefined') {
    module.exports = require;
}
