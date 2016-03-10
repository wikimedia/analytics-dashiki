'use strict';
define(function (require) {

    var ko = require('knockout'),
        moment = require('moment');

    require('datepicker');

    ko.bindingHandlers.datepicker = {
        init: function (element, valueAccessor) {
            var val = ko.unwrap(valueAccessor()),
                opt = val.options || {};

            opt = $.extend({
                format: 'YYYY-MM-DD' + (opt.timePicker ? ' HH:mm:ss' : ''),
            }, opt);

            if (val.start && val.end) {
                opt.startDate = moment.utc(ko.unwrap(val.start));
                opt.endDate = moment.utc(ko.unwrap(val.end));
            }

            $(element).daterangepicker(opt, function (start, end) {
                val.start(start.utc().toDate().getTime());
                val.end(end.utc().toDate().getTime());
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                // NOTE: no destroy available
                // $(element).daterangepicker('destroy');
            });
        }
    };
});
