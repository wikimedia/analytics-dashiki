'use strict';
define(function (require) {

    var component = require('components/visualizers/worldmap/worldmap'),
        $ = require('jquery'),
        ko = require('knockout'),
        TimeseriesData = require('models.timeseries'),
        sinon = require('sinon');

    var WorldMapVisualizer = component.viewModel;

    var mockData = {
        "2016-12-18": [
          ["Argentina", 3200],
          ["Russia", 30],
          ["Spain", 480]
        ],
        "2016-12-19": [
          ["United States of America", 20000],
          ["France", 10000],
          ["Algeria", 800]
        ]
    };

    var container = document.createElement('div');
    $(container).addClass('map-test');
    container.innerHTML = '<div class = "map-container" data-bind="worldmap: {data: data, date: date}" ></div>'
    document.body.appendChild(container);
    ko.bindingHandlers.worldmap.init(container);

    describe('The map', function () {
        it('should be painted blank on initialization', function () {
            expect($('svg > g > path', container)[0].attributes.fill.textContent).toEqual('#fff');
        });

        it('should have a class corresponding with its country code', function () {
            expect($($('svg > g > path', container)[0]).hasClass('country-533')).toBe(true);
        });

        describe('once data is loaded', function () {

            it('should paint a specific country white if there isn\'t data for it', function (done) {
                var valueAccessor = function(){return {data: mockData, date:  '2016-12-18'}};
                ko.bindingHandlers.worldmap.update(container, valueAccessor);
                _.defer(function () {
                    // Country with iso 68 (Bolivia) is not in data
                    expect($('.country-68').attr('fill')).toEqual('#fff');
                    done();
                });
            });
            it('should paint a specific country white if there isn\'t data for it', function (done) {
                var valueAccessor = function(){return {data: mockData, date:  '2016-12-18'}};
                ko.bindingHandlers.worldmap.update(container, valueAccessor);
                _.defer(function () {
                    // Country with iso 32 (Argentina) is in data
                    expect($('.country-32').attr('fill')).not.toEqual('#fff');
                    done();
                });
            });

            it('should display an error if there is no data', function (done) {
                var valueAccessor = function(){return {data: mockData, date:  '2016-12-20'}};
                ko.bindingHandlers.worldmap.update(container, valueAccessor);
                _.defer(function () {
                    expect($('.map-errorBox', container).length).not.toBeLessThan(1);
                    done();
                })
            });

            it('legend should paint as many slots as buckets have been set in the map', function (done) {
                var valueAccessor = function(){return {data: mockData, date:  '2016-12-18'}};
                ko.bindingHandlers.worldmap.update(container, valueAccessor);
                _.defer(function () {
                    expect($('.map-legend > svg > rect').length).toBe(9);
                    done();
                })
            });

            it('should draw a number of edge values equal to buckets plus one', function (done) {
                var valueAccessor = function(){return {data: mockData, date:  '2016-12-18'}};
                ko.bindingHandlers.worldmap.update(container, valueAccessor);
                _.defer(function () {
                    expect($('.map-legend > svg > text').length).toBe(10);
                    done();
                })
            });
        });

        afterAll(function () {
            $(container).remove();
        })
    });
});