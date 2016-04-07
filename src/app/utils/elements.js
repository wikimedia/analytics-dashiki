'use strict';
define(function (require) {

    require('jquery');

    return {
        getBounds: function (element, parentSelector) {
            var container = $(element).parents(parentSelector);

            return {
                width: container.innerWidth() || 0,
                height: container.innerHeight() || 0,
            };
        },
    };
});
