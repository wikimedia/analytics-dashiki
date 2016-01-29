'use strict';
define(function(require) {
    /**
     * Enhance ajax requests to have:
     *
     *  - Common error handling across all requests.
     *  - Ability to add custom headers for requests 1 one place.
     *
     * See: http://api.jquery.com/category/ajax/
     **/
    var logger = require('logger');

    /**
     * Not called for cross-domain requests, see ajaxComplete handler below
     **/
    $(document).ajaxError(function(e, xhr, settings) {
        logger.error(settings.url + ':' + xhr.status + '\n\n' + xhr.responseText);
    });

    $(document).ajaxComplete(function(event, xhr, settings) {
        if (xhr.statusCode() >= 400) {
            logger.error(settings.url + ':' + xhr.status + '\n\n' + xhr.responseText);
        }
    });
});
