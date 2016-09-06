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

            $(element).daterangepicker(opt);

            // we propagate changes on dates when apply button has been clicked
            $(element).on('apply.daterangepicker', function (ev, picker) {
                val.start(picker.startDate.toDate().getTime());
                val.end(picker.endDate.toDate().getTime());

            });

            // if time selection was changed w/o clicking 'apply'
            // secretly apply. Note that apply is triggered before 'hide'
            // ko is not going to do anything if apply was hit before
            $(element).on('hide.daterangepicker', function (ev, picker) {
                val.start(picker.startDate.toDate().getTime());
                val.end(picker.endDate.toDate().getTime());
            });


            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                // NOTE: no destroy available
                // $(element).daterangepicker('destroy');
            });
        }
    };
});
