define(function (require) {
    'use strict';

    var ko = require('knockout'),
        templateMarkup = require('text!./annotation-list.html'),
        annotationsApi = require('annotationsApi'),
        marked = require('marked'),
        moment = require('moment');

    require('twix');  // adds twix functionalities to moment lib
    require('./bindings');

    function AnnotationList(params) {

        this.metric = params.metric;
        this.rawAnnotations = ko.observable([]);

        this.getRawAnnotations = ko.computed(function () {
            var metric = ko.unwrap(this.metric);
            if (metric) {
                annotationsApi.get(metric, this.rawAnnotations);
            } else {
                this.rawAnnotations([]);
            }
        }, this);

        this.sortAnnotations = function (a, b) {
            // Uses start date as sort key
            a = a.start;
            b = b.start;

            if (!a && b || a && b && a < b) {
                return -1;
            } else if (a && !b || a && b && a > b) {
                return 1;
            }
            return 0;
        };

        this.formatDateRange = function (start, end) {
            // if start is undefined, return 'Beginning of time - <end>'
            // if end is undefined, return '<start> - Now'
            // if both are undefined, return 'Beginning of time - Now'
            if (!start || !end) {
                var formatDate = function (date, fallback) {
                    if (date) {
                        return moment(date).format('MMM DD, YYYY');
                    } else {
                        return fallback;
                    }
                };

                var formattedStart = formatDate(start, 'Beginning of time'),
                    formattedEnd = formatDate(end, 'Now');

                return formattedStart + ' - ' + formattedEnd;
            }

            // if both dates are defined, let twix do the magic
            return moment(start).twix(end, {allDay: true}).format();
        };

        this.annotations = ko.computed(function () {
            var self = this;

            return this.rawAnnotations()
                .sort(this.sortAnnotations)
                .map(function (annotation) {
                    return {
                        dateRange: self.formatDateRange(
                            annotation.start,
                            annotation.end
                        ),
                        // parses markdown and protects from malicious code
                        htmlNote: marked(annotation.note, {sanitize: true})
                    };
                });
        }, this);
    }

    return {
        viewModel: AnnotationList,
        template: templateMarkup
    };
});
