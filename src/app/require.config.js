'use strict';
// require.js looks for the following global when initializing
var require = {
    baseUrl: '/src',
    paths: {
        'd3'                    : '../node_modules/d3/d3',
        'd3-scale-chromatic'    : '../node_modules/d3-scale-chromatic/build/d3-scale-chromatic',
        'd3-interpolate'        : '../node_modules/d3-interpolate/build/d3-interpolate',
        'd3-color'              : '../node_modules/d3-color/build/d3-color',
        'datepicker'            : '../node_modules/semantic-datepicker/daterangepicker',
        'dygraphs'              : '../node_modules/dygraphs/dygraph-combined',
        'jquery'                : '../node_modules/jquery/dist/jquery',
        'knockout'              : '../node_modules/knockout/build/output/knockout-latest',
        'lodash'                : '../node_modules/lodash/lodash',
        'marked'                : '../node_modules/marked/lib/marked.umd',
        'mediawiki-storage'     : '../node_modules/mediawiki-storage/dist/mediawiki-storage',
        'moment'                : '../node_modules/moment/moment',
        'numeral'               : '../node_modules/numeral/numeral',
        'pageviews'             : '../node_modules/pageviews/pageviews.min',
        'text'                  : '../node_modules/requirejs-text/text',
        'topojson'              : '../node_modules/topojson/build/topojson',
        'twix'                  : '../node_modules/twix/dist/twix',
        'typeahead'             : '../node_modules/typeahead.js/dist/typeahead.jquery',
        'uri'                   : '../node_modules/urijs/src',
        'vega'                  : '../node_modules/vega/vega',

        'semantic-dropdown'     : '../semantic/dist/components/dropdown',
        'semantic-popup'        : '../semantic/dist/components/popup',
        'semantic-transition'   : '../semantic/dist/components/transition',

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

        // data
        'data.country-codes'        : 'lib/data/country-codes',
        'data.world-50m'            : 'lib/data/world-50m'
    },
    shim: {
        ajaxWrapper: {
            deps: ['jquery']
        },
        typeahead: {
            deps: ['jquery']
        },
        d3: {
            exports: 'd3',
        },
        vega: {
            deps: ['d3'],
        },
        'semantic-popup': {
            deps: ['jquery']
        },
        pageviews: {
            exports: 'pageviews',
        },
    }
};

if (typeof window === 'undefined') {
    module.exports = require;
}
