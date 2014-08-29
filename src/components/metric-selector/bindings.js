define(function(require) {
    'use strict';

    var ko              = require('knockout');

    var re = /([a-z])([A-Z])/g;
    /**
     * "TurnsSomeMetricNameLikeThis" into "Turns Some Metric Name Like This"
     */
    ko.bindingHandlers.metricName = {
        update: function(element, valueAccessor) {
            var metric = ko.unwrap(valueAccessor());
            $(element).text(metric.replace(re, '$1 $2'));
        }
    };
});
