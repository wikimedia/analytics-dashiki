define(function (require) {
    'use strict';

    var d3 = require('d3'),
        templateMarkup = require('text!./compare-timeseries.html');

    function CompareTimeseries (params) {
        $.extend(this, params);
        this.colors = params.colors || d3.scale.category10();

        //this.series = ko.pureComputed(function () {
            //var data = ko.unwrap(this.data);
        //});

        //function makeIntoSeries (prefix, rows, primary, column, index) {
            //return {
                //name: prefix + column,
                //color: this.colors(column) || '#000',
                //renderer: primary ? 'line' : 'dashed-line',
                //data: rows.map(function (row) {
                    //return {
                        //x: row[0],
                        //y: row.slice(1)[index],
                    //};
                //}),
            //};
        //}

        //this.getSeries = function (name, primary) {
            //var data = ko.unwrap(this.data);

            //return data.header.slice(1).map(function (column, index) {
                //return {
                    //name: name + column,
                    //color: this.colors(column) || '#000',
                    //renderer: primary ? 'line' : 'dashed-line',
                    //data: data.rows.map(function (row) {
                        //return {
                            //x: row[0],
                            //y: row.slice(1)[index],
                        //};
                    //}),
                //};
            //}, this);
        //};

        //this.series = ko.computed(function () {
            //var namedSeries = [];
            //namedSeries.push.apply(namedSeries, this.getSeries('a', true));
            //namedSeries.push.apply(namedSeries, this.getSeries('b', false));
            //return namedSeries;
        //}, this);
    }

    return {
        viewModel: CompareTimeseries,
        template: templateMarkup
    };
});
