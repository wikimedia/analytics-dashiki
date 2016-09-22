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
        'config'                : 'app/config',
        'logger'                : 'lib/logger',

        'api-finder'            : 'app/apis/api-finder',
        'dataConverterFactory'  : 'app/data-converters/factory',
        'typeahead'             : 'bower_modules/typeahead.js/dist/typeahead.bundle',
        'ajaxWrapper'           : 'lib/ajax-wrapper',
        'window'                : 'lib/window',
        'stateManager'          : 'lib/state-manager',
        'sitematrix'            : 'app/sitematrix',

        // *** viewmodels
        'viewmodels.copy-params'    : 'app/ko-extensions/common-viewmodels/copy-params',
        'viewmodels.single-select'  : 'app/ko-extensions/common-viewmodels/single-select',

        // *** custom observables
        'observables.async'         : 'app/ko-extensions/async-observables',

        // *** general custom bindings
        'datepicker-binding'        : 'app/ko-extensions/datepicker-binding',
        'knockout.table'            : 'lib/knockout-extensions/knockout-table',

        // *** apis
        'apis.wikimetrics'          : 'app/apis/wikimetrics',
        'apis.annotations'          : 'app/apis/annotations-api',
        'apis.aqs'                  : 'app/apis/aqs-api',
        'apis.datasets'             : 'app/apis/datasets-api',
        'apis.config'               : 'app/apis/config-api',

        // *** converters
        'converters.separated-values'       : 'app/data-converters/separated-values',
        'converters.simple-separated-values': 'app/data-converters/simple-separated-values',
        'converters.wikimetrics-timeseries' : 'app/data-converters/wikimetrics-timeseries',
        'converters.hierarchy-data'         : 'app/data-converters/hierarchy-data',
        'converters.timeseries'             : 'app/data-converters/timeseries-data',
        'converters.annotations'            : 'app/data-converters/annotations-data',
        'converters.aqs-api-response'       : 'app/data-converters/aqs-api-response',

        // *** utils
        'utils.arrays'              : 'app/utils/arrays',
        'utils.strings'             : 'app/utils/strings',
        'utils.datetime'            : 'app/utils/datetime',
        'utils.numbers'             : 'app/utils/numbers',
        'utils.colors'              : 'app/utils/colors',
        'utils.elements'            : 'app/utils/elements',

        // *** lib
        'lib.polyfills'             : 'lib/polyfills',
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
