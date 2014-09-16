/**
 * Proxy for URI.js as when running unit tests
 * we are not running on a browser context
 * we are trying to bypass URI access to window.location
 * We set a fake location in our tests and make URI.js work
 * with that in the context we load it.
 **/
define(['uri/URI'], function (_URI) {
    'use strict';


    window.URI = function () {

        // is there a uri on the global scope?
        if (window.fakeLocation) {
            return new _URI(window.fakeLocation);
        }
        return new _URI();
    }

    // setingup handy mocking method to bypass URI access of window.location
    // to be able to set URIs... this is like ugly
    window.fakeLocation = '';
    window.setFakeLocation = function (location) {
        window.fakeLocation = location
    }
    return window.URI;

});
