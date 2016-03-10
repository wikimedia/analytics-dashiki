'use strict';
define(function (require) {

    var templateMarkup = require('text!./table-timeseries.html'),
        ko = require('knockout');

    function TableTimeseries (params) {
        this.data = params.data;
        this.downloadLink = params.downloadLink;

        this.rows = ko.computed(function () {
            return ko.unwrap(this.data).rowData({
                convertToString: true,
                // only show a few rows to speed up rendering
                // TODO: paginate?
                limit: {
                    start: 0,
                    end: 200,
                },
            });
        }, this);
        this.header = ko.computed(function () {
            return ko.unwrap(this.data).header;
        }, this);
        this.colors = params.colors;
        this.containerHeight = params.height + 'px';
    }

    return {
        viewModel: TableTimeseries,
        template: templateMarkup
    };
});
