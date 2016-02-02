'use strict';
define(function (require) {

    var templateMarkup = require('text!./table-timeseries.html'),
        ko = require('knockout');

    function TableTimeseries (params) {
        this.data = params.data;
        this.downloadLink = params.downloadLink;

        this.largeDataset = ko.computed(function () {
            return ko.unwrap(this.data).size() > 1000;
        }, this);
        this.filter = ko.observable('');
        this.rows = ko.computed(function () {
            var dateFilter = ko.unwrap(this.filter);
            return ko.unwrap(this.data).rowData({
                convertToString: true,
                filter: function (row) {
                    return row[0].indexOf(dateFilter) >= 0;
                },
                limit: {
                    start: 0,
                    end: 10,
                },
            });
        }, this);
        this.header = ko.computed(function () {
            return ko.unwrap(this.data).header;
        }, this);
        this.colors = params.colors;
        this.height = params.height;
    }

    return {
        viewModel: TableTimeseries,
        template: templateMarkup
    };
});
