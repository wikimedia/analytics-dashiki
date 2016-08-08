'use strict';
define(function (require) {

    var ko = require('knockout'),
        moment = require('moment');

    require('datepicker');

    /**
     * See docs for datepicker: https://github.com/BreadMaker/semantic-ui-daterangepicker
     * Our dates are utc already so no need to convert them to UTC offset
     * http://momentjs.com/guides/
     **/
    ko.bindingHandlers.datepicker = {
        init: function (element, valueAccessor) {
            var val = ko.unwrap(valueAccessor()),
                opt = val.options || {};

            opt = $.extend({
                format: 'YYYY-MM-DD' + (opt.timePicker ? ' HH:mm:ss' : ''),
            }, opt);

            if (val.start && val.end) {
                opt.startDate = moment(ko.unwrap(val.start));
                opt.endDate = moment(ko.unwrap(val.end));
                opt.minDate = moment(ko.unwrap(val.minDate));
                //no need to extend dates past today's
                opt.maxDate = moment();
                opt.parentEl = $(element).parent()[0];
            }

            $(element).daterangepicker(opt, function (start, end) {
                val.start(start.toDate().getTime());
                val.end(end.toDate().getTime());
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                // NOTE: no destroy available
                // $(element).daterangepicker('destroy');
            });
        }
    };
});
