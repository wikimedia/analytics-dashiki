define(function (require) {
    'use strict';

    var ko = require('knockout'),
        d3 = require('d3'),
        _ = require('lodash');

    // Transforms the standard timeseriesData format
    // into the format needed for the stacked bars.
    function unfoldData (timeseriesData) {
        var header = timeseriesData.header.slice(1);

        return _(timeseriesData.rowData()).transform(function (result, row) {
            var rowName = row[1];

            if (!_.has(result, rowName)) {
                result[rowName] = {};
                result[rowName].rowName = rowName;
            }

            var rowMap = result[rowName];
            _.forEach(header, function (colName, index) {
                rowMap[colName] = (rowMap[colName] || 0) + row[index + 2];
            });

        }, {}).values().value();
    }

    function showTooltip(rect, d, text, svg) {
        var xPos = parseFloat(rect.attr('x')),
            yPos = parseFloat(rect.attr('y')),
            height = parseFloat(rect.attr('height')),
            width = parseFloat(rect.attr('width'));

        // Highlight rectange color
        d.previousFill = rect.attr('fill');
        var newFill = d3.rgb(d.previousFill).brighter();
        rect.attr('fill', newFill);

        // Create tooltip
        var tooltip = svg.append('text')
            .attr('x', xPos + width / 2)
            .attr('y', yPos + height / 2)
            .attr('class', 'stacked-bars-tooltip')
            .style('pointer-events', 'none')
            .style('font-size', '12px')
            .style('text-anchor', 'middle')
            .style('alignment-baseline', 'middle')
            .text(text);

        // Calculate bounding box depending on text size
        var tooltipBox = tooltip[0][0].getBBox(),
            tooltipWidth = tooltipBox.width + 16,
            tooltipHeight = tooltipBox.height + 16;

        // Create tooltip box
        var box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        box.setAttribute('x', xPos + width / 2 - tooltipWidth / 2);
        box.setAttribute('y', yPos + height / 2 - tooltipHeight / 2);
        box.setAttribute('rx', 4);
        box.setAttribute('ry', 4);
        box.setAttribute('class', 'stacked-bars-tooltip-box');
        box.setAttribute('width', tooltipWidth);
        box.setAttribute('height', tooltipHeight);
        box.setAttribute('fill', 'white');
        box.setAttribute('fill-opacity', 0.8);
        box.setAttribute('stroke', 'black');
        box.setAttribute('stroke-width', 0.2);
        box.setAttribute('style', 'pointer-events:none;text-anchor:middle;alignment-baseline:middle');
        svg[0][0].insertBefore(box, tooltip[0][0]);
    }

    function deleteTooltip (rect, d, svg) {
        svg.select('.stacked-bars-tooltip').remove();
        svg.select('.stacked-bars-tooltip-box').remove();
        rect.attr('fill', d.previousFill);
    }

    function transition2Absolute(stateRelative, stateAbsolute, svg) {
        // Currently it is Relative
        stateRelative.selectAll('rect').transition().style('opacity', 0).style('visibility', 'hidden');
        stateAbsolute.selectAll('rect').transition().style('opacity', 1).style('visibility', 'visible');
        svg.select('.y.axis.relative').transition().style('opacity', 0);
        svg.select('.y.axis.absolute').transition().style('opacity', 1);
    }

    function transition2Relative(stateAbsolute, stateRelative, svg) {
        // Currently it is absolute
        stateAbsolute.selectAll('rect').transition().style('opacity', 0).style('visibility', 'hidden');
        stateRelative.selectAll('rect').transition().style('opacity', 1).style('visibility', 'visible');
        svg.select('.y.axis.absolute').transition().style('opacity', 0);
        svg.select('.y.axis.relative').transition().style('opacity', 1);
    }

    ko.bindingHandlers.stackedBars = {
        update: function (element, valueAccessor) {
            var timeseriesData = ko.unwrap(valueAccessor().data),
                colors = ko.unwrap(valueAccessor().colors),
                data = unfoldData(timeseriesData.data),
                side = timeseriesData.label;

            if (!_.isEmpty(data)) {
                // This code inside this if clause is based on this example:
                // http://bl.ocks.org/yuuniverse4444/8325617
                // Thanks yuuniverse4444

                var margin = {top: 20, right: 20, bottom: 30, left: 60},
                    width = 500 - margin.left - margin.right,
                    height = 400 - margin.top - margin.bottom;

                var x = d3.scale.ordinal().rangeRoundBands([0, width], .1),
                    yAbsolute = d3.scale.linear().rangeRound([height, 0]),
                    yRelative = d3.scale.linear().rangeRound([height, 0]);

                var xAxis = d3.svg.axis().scale(x).orient('bottom');

                var yAxisRelative = d3.svg.axis()
                    .scale(yRelative)
                    .orient('left')
                    .tickFormat(d3.format('.0%'));

                var yAxisAbsolute = d3.svg.axis()
                    .scale(yAbsolute)
                    .orient('left')
                    .tickFormat(d3.format('2s'));

                // Remove previous charts if existing
                d3.select('.stacked-bars-chart' + side).remove();

                var svg = d3.select(element).append('svg')
                    .attr('class', 'stacked-bars-chart' + side)
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                // Setup the color configuration
                var domainNames = _.keys(data[0]).filter(function (key) {
                    return key !== 'rowName';
                });
                var color = d3.scale.ordinal().range(
                    domainNames.map(function (key) {
                        return colors(key);
                    })
                );
                color.domain(domainNames);

                // Decorate data with additional information
                data.forEach(function (row) {
                    var y0 = 0;
                    row.columns = color.domain().map(function (name) {
                        return {rowName: row.rowName, name: name, y0: y0, y1: y0 += +row[name]};
                    });

                    row.total = row.columns[row.columns.length - 1].y1; // the last row
                    row.pct = [];

                    for (var i = 0; i < row.columns.length; i++) {

                        var yCoordinate = +row.columns[i].y1 / row.total;
                        var yHeight1 = (row.columns[i].y1) / row.total;
                        var yHeight0 = (row.columns[i].y0) / row.total;
                        var yPct = yHeight1 - yHeight0;
                        row.pct.push({
                            yCoordinate: yCoordinate,
                            yHeight1: yHeight1,
                            yHeight0: yHeight0,
                            name: row.columns[i].name,
                            rowName: row.rowName,
                            yPct: yPct
                        });
                    }
                });

                // Define ranges for the axes
                x.domain(data.map(function (d) { return d.rowName; }));
                yAbsolute.domain([0, d3.max(data, function (d) { return d.total; })]); // Absolute View scale
                yRelative.domain([0, 1]); // Relative View domain

                // Define a boolean variable, true is absolute view,
                // false is relative view. Initial view is absolute
                var absoluteView = false;

                // Add the x-axis to the graph
                svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(0,' + height + ')')
                    .style('font-size', '12px')
                    .call(xAxis);

                /// Define the rect of Relative
                var stateRelative = svg.selectAll('.relative')
                    .data(data)
                    .enter().append('g')
                    .attr('class', 'relative');

                stateRelative.selectAll('rect')
                    .data(function (d) { return d.pct; })
                    .enter().append('rect')
                    .attr('width', x.rangeBand())
                    .attr('y', function (d) { return yRelative(d.yCoordinate); })
                    .attr('x', function (d) {return x(d.rowName); })
                    .attr('height', function (d) {
                        return yRelative(d.yHeight0) - yRelative(d.yHeight1); //distance
                    })
                    .attr('fill', function (d) { return color(d.name); })
                    .attr('stroke', 'pink')
                    .attr('stroke-width', 0.2)
                    .attr('class', 'relative')
                    .attr('name', function (d) { return d.name; })
                    .style('pointer-events', 'visible')
                    .on('mouseover', function(d){
                        var rect = d3.select(this),
                            percentage = Math.floor(d.yPct.toFixed(2) * 100),
                            text = rect.attr('name') + ': ' + percentage + '%';

                        showTooltip(rect, d, text, svg);
                    })
                    .on('mouseout', function(d){
                        deleteTooltip(d3.select(this), d, svg);
                    });
                /// End of define rect of relative

                /// Define rect for absolute
                var stateAbsolute = svg.selectAll('.absolute')
                    .data(data)
                    .enter().append('g')
                    .attr('class', 'absolute');

                stateAbsolute.selectAll('rect')
                    .data(function (d) { return d.columns; })
                    .enter().append('rect')
                    .attr('width', x.rangeBand())
                    .attr('y', function (d) { return yAbsolute(d.y1); })
                    .attr('x', function (d) { return x(d.rowName); })
                    .attr('height', function (d) { return yAbsolute(d.y0) - yAbsolute(d.y1); })
                    .attr('fill', function (d) { return color(d.name); })
                    .attr('class', 'absolute')
                    .attr('name', function (d) { return d.name; })
                    .style('pointer-events', 'visible')
                    .attr('opacity', 0) // initially it is invisible, i.e. start with Absolute View
                    .on('mouseover', function(d){
                        var rect = d3.select(this),
                            value = Math.floor((d.y1 - d.y0).toFixed(2)),
                            text = rect.attr('name') + ': ' + value;

                        showTooltip(rect, d, text, svg);
                    })
                    .on('mouseout', function(d){
                        deleteTooltip(d3.select(this), d, svg);
                    });
                /// End of define absolute

                //define two different scales, but one of them will always be hidden.
                svg.append('g')
                    .attr('class', 'y axis absolute')
                    .style('font-size', '12px')
                    .call(yAxisAbsolute)
                    .append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('y', 6)
                    .attr('dy', '.71em')
                    .style('text-anchor', 'end');

                svg.append('g')
                    .attr('class', 'y axis relative')
                    .style('font-size', '12px')
                    .call(yAxisRelative)
                    .append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('y', 6)
                    .attr('dy', '.71em')
                    .style('text-anchor', 'end');

                svg.select('.y.axis.absolute').style('opacity', 0);

                var clickButton = svg.selectAll('.clickButton')
                    .data([30, 30])
                    .enter().append('g')
                    .attr('class', 'clickButton')
                    .style('cursor', 'pointer');

                var buttonClass = 'clickChangeView' + side; // append side to avoid collision

                clickButton.append('text')
                    .attr('x', width - 8)
                    .attr('y', -10)
                    .attr('dy', '.35em')
                    .style('text-anchor', 'end')
                    .text('Switch View')
                    .style('font-size', '12px')
                    .attr('fill', 'blue')
                    .attr('class', buttonClass);

                // start with relative view
                transition2Relative(stateAbsolute, stateRelative, svg);

                // Switch view on click the clickButton
                d3.selectAll('.' + buttonClass)
                    .on('click', function(){
                        if(absoluteView){ // absolute, otherwise relative
                            transition2Relative(stateAbsolute, stateRelative, svg);
                        } else {
                            transition2Absolute(stateRelative, stateAbsolute, svg);
                        }
                        absoluteView = !absoluteView; // change the current view status
                    });
            }
        }
    };
});
