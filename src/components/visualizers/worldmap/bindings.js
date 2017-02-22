'use strict';
define(function (require) {
    var d3 = require('d3'),
        d3_color = require('d3-scale-chromatic'),
        ko = require('knockout'),
        topojson = require('topojson'),
        borders = require('data.world-50m'),
        isoCodes = require('data.country-codes'),
        _ = require('lodash');

    function getZoomBehavior (features, path, projection) {
        return d3.behavior.zoom()
        .on('zoom',function() {
            features.attr('transform','translate(' +
                d3.event.translate.join(',') + ')scale(' + d3.event.scale + ')');
            features.selectAll('path')
            .attr('d', path.projection(projection));
        });
    }

    function initMap (container) {
        var path = d3.geo.path();
        var projection = path.projection(d3.geo.mercator());
        var svg = d3.select(container).append('svg');
        var g = svg.append('g');
        var features = g.selectAll('path').data(topojson.feature(borders, borders.objects.countries).features);
        features.enter().append('path')
        .attr('stroke', '#aaa')
        .attr('stroke-width', '1px')
        .attr('fill', '#fff')
        .attr('d', projection)
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('class', function (feature) {
            return 'country-' + feature.id;
        });
        svg.call(getZoomBehavior(features, path, projection));
    }

    function removeErrorBox(container) {
        d3.select(container).select('.map-errorBox').remove();
    }

    function getColor (dataByCountry, feature, scale, palette) {
        var country = isoCodes[feature.id];
        var value = dataByCountry[country];
        if (isNaN(value)) { return '#fff'; }
        return palette[Math.floor(scale(value))];
    }

    function showError (container, errorMessage) {
        var parentHeight = container.offsetHeight;
        var errorBox = d3.select(container).append('div')
            .style('transform', 'translate(0,-' + parentHeight / 2 + 'px)')
            .style('padding', '10px')
            .style('text-align', 'center')
            .style('background-color', '#bbb')
            .attr('class', 'map-errorBox');
        errorBox.text(errorMessage);
    }

    function getDataValues (data, date) {
        var currentData = data[date];
        if (!currentData || currentData.length === 0) {
            throw 'There is no data for this selection';
        }
        return currentData;
    }

    function kFormat (num) {
        num = parseInt(num);
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num;
    }

    function addLegend (container, palette, min, max) {
        d3.select('.map-legend').remove();
        var legendBox = d3.select(container).append('div').attr('class','map-legend');
        var padding = 15, width = 300;
        legendBox
            .style('position', 'absolute')
            .style('top','10px')
            .style('right', '10px')
            .style('width', width + 'px')
            .style('background-color', 'rgba(255,255,255,0.8)');

        legendBox.append('h4')
            .style('margin', padding + 'px')
            .text('Pageviews per country');

        var svg = legendBox.append('svg');
        var boxHeight = 15;
        svg.style('height', 3 * boxHeight + 'px');
        var boxSize = (width - padding * 2) / palette.length;

        palette.forEach(function (color, i) {
            svg.append('rect')
                .style('fill', color)
                .style('x', (padding + i * boxSize) + 'px')
                .style('width', boxSize + 'px')
                .style('height', boxHeight + 'px');
            var bucketMin = min + i * (max - min) / palette.length;
            svg.append('text')
                .attr('y', (boxHeight + 10))
                .attr('x', padding + i * boxSize)
                .style('font-size', '8px')
                .style('text-anchor', 'middle')
                .text(kFormat(bucketMin));
        });

        // Last number in legend
        svg.append('text')
            .attr('y', (boxHeight + 10))
            .attr('x', padding + palette.length * boxSize)
            .style('font-size', '8px')
            .style('text-anchor', 'middle')
            .text(kFormat(max));
    }

    ko.bindingHandlers.worldmap = {
        init: function (element) {
            initMap(element);
        },
        update: function (element, valueAccessor) {
            var values = ko.unwrap(valueAccessor());
            var data = values.data;
            var date = values.date;
            var buckets = 9;
            var palette = d3_color.schemeBlues[buckets];
            removeErrorBox(element);
            try {
                var currentData = getDataValues(data, date);
                drawMap(element, currentData, buckets, palette);
            } catch (error) {
                showError(element, error);
            }
        }
    };

    function drawMap (container, currentData, buckets, palette) {
        var values = currentData.map(function(row) {
            // Temporarily assuming that the value we're after is the second column
            return row[1];
        });
        var min = d3.min(values);
        var max = d3.max(values);
        var scale = d3.scale.linear().domain([min, max]).range([0, buckets - 1]);
        var dataByCountry = currentData.reduce(function(p,c) {
            p[c[0]] = c[1];
            return p;
        }, {});
        borders.objects.countries.geometries = borders.objects.countries.geometries.map(function (f) {
            f.properties = {
                color: getColor(dataByCountry, f, scale, palette)
            };
            return f;
        });
        _.defer(function () {
            var svg = d3.select(container).select('svg');
            var g = svg.select('g');
            var features = g.selectAll('path').data(topojson.feature(borders, borders.objects.countries).features);
            features.attr('fill', function (feature) {
                return feature.properties.color;
            });
            addLegend(container, palette, min, max);
        });
    }

});
