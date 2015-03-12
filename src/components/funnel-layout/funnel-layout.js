define(function (require) {
    'use strict';

    var ko = require('knockout'),
        templateMarkup = require('text!./funnel-layout.html');

    function FunnelLayout() {
        this.wiki = {
            options: ko.observable(['enwiki', 'rowiki', 'All Wikis']),
            selected: ko.observable('All Wikis'),
        };
        this.fromDate = {
            options: ko.observable(['2014-01-01', '2014-02-01', '2014-03-01']),
            selected: ko.observable('2014-01-01'),
        };
        this.toDate = {
            options: ko.observable(['2014-01-01', '2014-02-01', '2014-03-01']),
            selected: ko.observable('2014-02-01'),
        };
        this.editor = {
            options: ko.observable(['VE', 'Both', 'WT']),
            selected: ko.observable('VE'),
        };
    }

    return {
        viewModel: FunnelLayout,
        template: templateMarkup
    };
});
