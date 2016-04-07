'use strict';
define(function (require) {

    var arrays = require('utils.arrays'),
        strings = require('utils.strings'),
        datetime = require('utils.datetime'),
        numbers = require('utils.numbers'),
        colors = require('utils.colors'),
        elements = require('utils.elements');

    describe('Array Utilities', function () {

        it('should make a zero-filled array', function () {
            expect(arrays.filler(3)).toEqual([undefined, undefined, undefined]);
        });
    });

    describe('String Utilities', function () {
        var dateString = '2015-01-02 00:00:10',
            dateString2 = '2015-01-02 00:00:20',
            floatString = '1234.40',
            d = strings.parserFromSample(dateString),
            f = strings.parserFromSample(floatString);

        var timediff = d(dateString2).getTime() - d(dateString).getTime();

        it('should parse dates or numbers properly', function () {
            expect(timediff).toBe(10000);
            expect(f(floatString)).toBe(1234.40);
        });
    });

    describe('Datetime Utilities', function () {

        it('should format a span of dates', function () {
            expect(datetime.timespan('2015-01-30', '2015-02-01'))
                .toBe('Jan 30 - Feb 1, 2015');
        });
    });

    describe('Number Utilities', function () {

        it('should format kmb', function () {
            expect(numbers.numberFormatter('kmb')(1234567)).toBe('1.2m');
            expect(numbers.numberFormatter('0.00a')(1234567)).toBe('1.23m');
            expect(numbers.numberFormatter('percent')(0.123)).toBe('12.3%');
        });
    });

    describe('Color Utilities', function () {
        var scale = colors.category10();

        scale('one');
        scale('two');
        scale('three');

        it('should produce consistent colors', function () {
            expect(scale('one')).toBe(scale('one'));
        });
    });

    describe('Element Utilities', function () {
        // needs DOM to test
        it('should define something', function () {
            expect(elements.getBounds).toBeDefined();
        });
    });
});