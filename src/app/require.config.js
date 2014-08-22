/* jshint -W098 */
/* jshint -W079 */
'use strict';
// require.js looks for the following global when initializing
var require = {
    baseUrl: ".",
    paths: {
        "jquery"    : "bower_modules/jquery/dist/jquery",
        "knockout"  : "bower_modules/knockout/dist/knockout",
        "text"      : "bower_modules/requirejs-text/text",
        "d3"        : "bower_modules/d3/d3",
        "vega"      : "bower_modules/vega/vega",
        "topojson"  : "bower_modules/topojson/topojson",
        "moment"    : "bower_modules/moment/moment"
    }
    // TODO: figure out cache busting.  This causes errors in testing:
    // urlArgs: "bust=" +  (new Date()).getTime()
};
