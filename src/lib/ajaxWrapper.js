/* jshint -W098 */
define(['jquery'], function($) {
    'use strict';
    /**
     * Enhance ajax requests to have:
     *
     *  - Common error handling across all requests.
     *  - Ability to add custom headers for requests 1 one place.
     *
     * See: http://api.jquery.com/category/ajax/
     **/

    /**
     * Not called for cross-domain requests, see ajaxComplete handler below
     **/
    $(document).ajaxError(function(e, xhr, settings, thrownError) {
        logger.error(settings.url + ':' + xhr.status + '\n\n' + xhr.responseText);
    });

    $(document).ajaxComplete(function(event, xhr, settings) {
        if (xhr.statusCode() >= 400) {
           logger.error(settings.url + ':' + xhr.status + '\n\n' + xhr.responseText);
        }
    });
});
