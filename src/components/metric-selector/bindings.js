'use strict';
define(function(require) {

    var ko = require('knockout');

    var re = /([a-z])([A-Z])/g;
    /**
     * "TurnsSomeMetricNameLikeThis" into "Turns Some Metric Name Like This"
     */
    ko.bindingHandlers.metricName = {
        init: function() {
            // Prevent binding on the dynamically-injected text node (as developers are unlikely to expect that, and it has security implications).
            // It should also make things faster, as we no longer have to consider whether the text node might be bindable.
            return {controlsDescendantBindings: true};
        },
        update: function(element, valueAccessor) {
            var metric = ko.unwrap(valueAccessor());
            if (metric) {
                var metricName = metric.displayName || metric.name.replace(re, '$1 $2');
                ko.utils.setTextContent(element, metricName);
            }
        }
    };
});
