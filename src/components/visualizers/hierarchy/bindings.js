'use strict';

define(function (require) {

    var d3 = require('d3'),
        ko = require('knockout');

    var x, y, // Scales to draw the sunburst.
        radius;

    // Given a node in a partition layout, return an array of all of
    // its ancestor nodes, highest first, but excluding the root.
    function getAncestors(node) {
        var path = [];
        var current = node;
        while (current.parent) {
            path.unshift(current);
            current = current.parent;
        }
        return path;
    }

    function hoverPath (d) {
        // If the click is on a node outside the domain (can happen in d3!), ignore it.
        if (d.x + d.dx < x.domain()[0] || d.x > x.domain()[1]) {
            return;
        }
        // If the mouse is on the sunburst's center, hover out.
        if (y.domain()[0] === d.y) {
            hoverOut.bind(this)();
            return;
        }

        // Get the percentage string.
        var percentage = (d.value / this.totalSize * 100).toPrecision(2),
            percentageString = percentage + '%';
        if (percentage < 0.1) {
            percentageString = '< 0.1%';
        }

        // Update the breadcrumb values.
        var sequenceArray = getAncestors(d);
        sequenceArray = sequenceArray.slice(
            this.bindingContext.within().length,
            sequenceArray.length
        );
        this.bindingContext.represents(sequenceArray);
        this.bindingContext.percentage(percentageString);

        // Highlight only those that are an ancestor of the current node. The
        // transition is needed because it allows d3 to resolve the hoverOut
        // properly. Otherwise, race conditions create an inconsistent state.
        this.container.selectAll('path').transition().duration(50)
            .style('opacity', function (node) {
                return sequenceArray.indexOf(node) >= 0 ? 0.25 : 1;
            });
    }

    function hoverOut() {
        this.bindingContext.represents([]);
        this.bindingContext.percentage('');
        this.container.selectAll('path').transition().duration(500)
            .style('opacity', 1);
    }

    function click(d) {
        // If the click is on a node outside the domain (can happen in d3!), ignore it.
        if (d.x + d.dx < x.domain()[0] || d.x > x.domain()[1]) {
            return;
        }
        // If the click is on the center, go up one level.
        if (y.domain()[0] === d.y) {
            d = d.parent;
        }
        // If the click is on a leaf, don't do anything.
        if (!d.children) {
            return;
        }

        // Remove the previous labels.
        this.container.selectAll('text').remove();

        // Execute the zoom.
        var that = this,
            n = 0;
        hoverOut.bind(that)();
        that.container
            .attr('pointer-events', 'none')
            .transition()
            .duration(750)
            .tween('scale', function() {
                var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                    yd = d3.interpolate(y.domain(), [d.y, 1]),
                    yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);

                return function(t) {
                    x.domain(xd(t));
                    y.domain(yd(t)).range(yr(t));
                };
            })
            .selectAll('path')
                .attrTween('d', function(node) {
                    n++;
                    return function() { return that.arc(node); };
                })
            .each('end', function() {
                n--;
                // n is a hack to be able to execute a block of code
                // only when all elements have finished transitioning.
                if (n === 0) {
                    that.container.attr('pointer-events', null);
                    addLabels.bind(that)(d.depth + 1, d.depth + 2);
                }
            });

        // Update context.
        that.totalSize = d.value;
        that.bindingContext.within(getAncestors(d));
    }

    function getChildHue (minHue, maxHue, index, length, accumulated, value, total) {
        var minMaxRange = maxHue - minHue,
            // countStart and countEnd would choose one equal hue range
            // for each child, regardless of its size.
            countStart = index / length,
            countEnd = (index + 1) / length,
            // sizeStart and sizeEnd would choose a hue range proportional
            // to the child's size.
            sizeStart = accumulated / total,
            sizeEnd = (accumulated + value) / total,
            // A combination (average) of both methods seems to achieve
            // a better hue range distribution.
            combinedStart = (countStart + sizeStart) / 2,
            combinedEnd = (countEnd + sizeEnd) / 2,
            // A 10% of the available hue range will be skipped, to make
            // the distinction between cousins more clear.
            skipRange = (combinedEnd - combinedStart) / 10,
            hueStart = minHue + (combinedStart + skipRange) * minMaxRange,
            hueEnd = minHue + (combinedEnd - skipRange) * minMaxRange;
        return [hueStart, hueEnd];
    }

    /**
     * Gives colors to the nodes of a subhierarchy.
     *
     * The colors are given in a way that children nodes hues are similar
     * to their parent's hues (to make the sunburst more intuitive and
     * predictable) and at the same time the algorithm tries to take advantage
     * of the whole hue-saturation-lightness spectrum to differentiate
     * between siblings.
     *
     * Params:
     *     hierarchy   The hierarchy to colorize.
     *     hue         A hue interval from which assign colors to all hierarchy nodes.
     *     saturation  The saturation factor of the root node.
     *     lightness   The lightness factor if the root node.
     */
    function rColorizeHierarchy (hierarchy, hue, saturation, lightness) {
        // The hue of the root node is in the middle (average) of the given interval.
        hierarchy.color = d3.hsl((hue[0] + hue[1]) / 2, saturation, lightness);
        if (hierarchy.children) {
            // Saturation and lightness are used to distinguish siblings.
            // For each child both are going to be decreased by decayFactor.
            var decayFactor = 1 - 0.5 / hierarchy.children.length,
                lastSiblingAbsoluteAngle = 0;
            hierarchy.children.forEach(function (child, index) {
                // Given the parent's hue interval and the position and proportion
                // of the child in the chart, get the child's hue interval.
                var childHue = getChildHue(
                    hue[0], hue[1],
                    index, hierarchy.children.length,
                    lastSiblingAbsoluteAngle, child.value, hierarchy.value
                );
                rColorizeHierarchy(child, childHue, saturation, lightness);
                lastSiblingAbsoluteAngle += child.value;
                // Saturation=0 means gray, saturation=1 means full color.
                // Make the next sibling a bit more like gray.
                saturation *= decayFactor;
                // Lightness=0 means black, lightness=1 means white.
                // Make the next sibling a bit lighter.
                lightness = Math.pow(lightness, decayFactor);
            });
        }
    }

    /**
     * Gives colors to the nodes of a hierarchy.
     *
     * This method assigns colors to the hierarchy's top level and calls
     * rColorizeHierarchy to colorize each sub-hierarchy passing a given
     * hue interval.
     */
    function colorizeHierarchy (hierarchy) {
        if (!hierarchy.children) { return; }

        hierarchy.color = d3.hsl(0, 1, 1); // The root is white.

        var lastSiblingAbsoluteAngle = 0;
        hierarchy.children.forEach(function (child, index) {
            var childHue = getChildHue(
                0, 360,
                index, hierarchy.children.length,
                lastSiblingAbsoluteAngle, child.value, hierarchy.value
            );
            rColorizeHierarchy(child, childHue, 1, 0.5);
            lastSiblingAbsoluteAngle += child.value;
        });
    }

    function getLabelAngle (d, arc) {
        // Offset the angle by 90 deg since the '0' degree axis for arc is Y axis, while
        // for text it is the X axis.
        var angleAverage = (arc.startAngle()(d) + arc.endAngle()(d)) / 2;
        return 180 / Math.PI * angleAverage - 90;
    }

    function addLabels (fromDepth, toDepth) {
        var that = this;
        this.container.selectAll('g').append('text')
            .filter(function (d) {
                var baseNode = d;
                while (baseNode.depth >= fromDepth) {
                    baseNode = baseNode.parent;
                }
                return (
                    d.depth >= fromDepth &&
                    d.depth <= toDepth &&
                    d.dx / baseNode.dx > 0.03 &&  // wide enough (>3%)
                    d.x >= x.domain()[0] &&  // within the zoom
                    d.x + d.dx <= x.domain()[1]
                );
            })
            .text(function (d) { return d.name; })
            .attr('text-anchor', 'middle')
            // Translate to the desired point and set the rotation.
            .attr('transform', function (d) {
                var angle = getLabelAngle(d, that.arc);
                return 'translate(' + that.arc.centroid(d) + ')' +
                       'rotate(' + (angle > 90 ? angle - 180 : angle) + ')';
            })
            .attr('dy', '.35em')  // vertical-align
            .attr('pointer-events', 'none');
    }

    ko.bindingHandlers.sunburst = {
        // TODO: this does not update properly when the data changes, it paints new versions underneath I think
        update: function (element, valueAccessor, viewModel, bindingContext) {
            var height = bindingContext.height,
                width = $(element).parents('.resizable.container').innerWidth();

            bindingContext.width(width);
            radius = ko.unwrap(bindingContext.radius);

            // To avoid a floating point bug in d3 partition layout,
            // the range of the x scale needs to be rounded to integers.
            // For greater precision, 10 * 360 (degrees) is used.
            // Later, startAngle and endAngle functions will reconvert
            // those values to the expected [0, 2* Math.PI] range.
            x = d3.scale.linear().rangeRound([0, 3600]).clamp(true);
            y = d3.scale.sqrt().range([0, radius]);
            var d2r = d3.scale.linear().domain([0, 3600]).range([0, 2 * Math.PI]);

            var el = d3.select(element)
                    .attr('width', width)
                    .attr('height', height),

                partition = d3.layout.partition()
                    .value(function(d) { return d.size; }),

                arc = d3.svg.arc()
                    .startAngle(function(d) {
                        return Math.max(0, Math.min(2 * Math.PI, d2r(x(d.x))));
                    }).endAngle(function(d) {
                        return Math.max(0, Math.min(2 * Math.PI, d2r(x(d.x + d.dx))));
                    }).innerRadius(function(d) {
                        return Math.max(0, y(d.y - d.dy));
                    }).outerRadius(function(d) {
                        return Math.max(0, y(d.y));
                    });

            // clean up after the old rendering
            el.select('g').remove();

            var container = el.append('g')
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

            // not sure about this pattern, saving references in DOM elements... hm
            element.sunburst = {
                container: container,
                partition: partition,
                arc: arc,
                totalSize: 0,
                bindingContext: bindingContext,
            };

            var val = ko.unwrap(valueAccessor()),
                data = ko.unwrap(val.hierarchy),
                nodes = element.sunburst.partition.nodes(data);

            colorizeHierarchy(data);

            var path = element.sunburst.container.data([data]).selectAll('path')
                .data(nodes).enter().append('g').append('path')
                .attr('d', element.sunburst.arc)
                .attr('fill-rule', 'evenodd')
                .style('fill', function (d) { return d.color; })
                .style('cursor', function (d) {
                    return d.children ? 'pointer' : 'normal';
                })
                .on('mouseover', hoverPath.bind(element.sunburst))
                .on('click', click.bind(element.sunburst));

            addLabels.bind(element.sunburst)(1, 2);

            // Get total size of the tree = value of root node from partition.
            element.sunburst.totalSize = path.node().__data__.value;

            // Highlight greatest leaf.
            var greatestLeaf = element.sunburst.container.select('path').datum();
            while (greatestLeaf.children) {
                greatestLeaf = greatestLeaf.children[0];
            }
            setTimeout(function () {
                hoverPath.bind(element.sunburst)(greatestLeaf);
            }, 50);  // To avoid race condition that breaks zoom.
        }
    };
});
