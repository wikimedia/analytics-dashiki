/**
 * It is quite useful to have window as stand alone module to be able to mock it in testing
 * Methods in window are not easy to mock as they are mostly read-only
 * only
 * **/
define(function () {
    'use strict';

    return window;
});
