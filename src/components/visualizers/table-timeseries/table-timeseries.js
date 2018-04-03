'use strict';
define(function (require) {

    var templateMarkup = require('text!./table-timeseries.html'),
        ko = require('knockout');

    require('knockout.table');

    function TableTimeseries (params) {
        this.data = params.data;
        this.downloadLink = params.downloadLink;

        this.rows = ko.computed(function () {
            return ko.unwrap(this.data).rowData({
                convertToString: true,
                // only show the last few rows to speed up rendering
                // TODO: paginate, T191270
                limit: { start: -900 },
            });
        }, this);
        this.header = ko.computed(function () {
            return ko.unwrap(this.data).header;
        }, this);
        this.colors = params.colors;
        this.containerHeight = params.height + 'px';

        this.tableData = ko.computed(function () {
            var header = ['Date'];

            header.push.apply(header, this.header());
            return {
                header: header,
                data: this.rows(),
                dataItem: function(row, col, data) {
                    return ko.utils.safeString(params.format(data[row][col]));
                }
            };
        }, this);
    }

    return {
        viewModel: TableTimeseries,
        template: templateMarkup
    };
});
