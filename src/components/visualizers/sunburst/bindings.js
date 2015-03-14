define(function (require) {

    var d3 = require('d3'),
        ko = require('knockout');

    require('lib/polyfills');

    // Given a node in a partition layout, return an array of all of its ancestor
    // nodes, highest first, but excluding the root.
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

        var percentage = (100 * d.value / this.totalSize).toPrecision(3);
        var percentageString = percentage + '%';
        if (percentage < 0.1) {
            percentageString = '< 0.1%';
        }

        var sequenceArray = getAncestors(d);
        this.bindingContext.steps(sequenceArray);
        this.bindingContext.percentage(percentageString);
        this.bindingContext.ratio('(' + d.value + ' out of ' + this.totalSize + ')');

        // Highlight only those that are an ancestor of the current segment.
        // The transition is necessary because it allows d3 to resolve the hoverOut
        //   transition properly.  Without it, race conditions would create an
        //   inconsistent state
        this.container.selectAll('path').transition().duration(50)
            .style('opacity', function (d) {
                return sequenceArray.indexOf(d) >= 0 ? 1 : 0.2;
            });
    }

    function hoverOut() {
        this.bindingContext.steps([]);
        this.bindingContext.percentage('');

        var sequenceArray = this.bindingContext.steps();
        this.container.selectAll('path').transition().duration(500)
            .style('opacity', function(d){
                return sequenceArray.indexOf(d) >= 0 ? 0.2 : 1;
            });
    }

    ko.bindingHandlers.sunburst = {
        init: function (element, valueAccessor, viewModel, bindingContext) {
            bindingContext.width($(element).parents('.resizable.container').innerWidth());

            var width = ko.unwrap(bindingContext.width),
                height = ko.unwrap(bindingContext.height),
                radius = ko.unwrap(bindingContext.radius),

                container = d3.select(element)
                    .attr('width', width)
                    .attr('height', height)
                    .append('g')
                        .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')'),

                partition = d3.layout.partition()
                    .size([2 * Math.PI, radius * radius])
                    .value(function(d) { return d.size; }),

                arc = d3.svg.arc()
                    .startAngle(function(d) { return d.x; })
                    .endAngle(function(d) { return d.x + d.dx; })
                    .innerRadius(function(d) { return Math.sqrt(d.y); })
                    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

            // not sure about this pattern, saving references in DOM elements... hm
            element.sunburst = {
                container: container,
                partition: partition,
                arc: arc,
                totalSize: 0,
                bindingContext: bindingContext,
            };

            // Bounding circle underneath the sunburst, to make it easier to detect
            // when the mouse leaves the parent g.
            container.append('circle')
                .attr('r', radius + 5)
                .style('opacity', 0)
                .on('mouseover', hoverOut.bind(element.sunburst));
        },

        update: function (element, valueAccessor) {
            var val = ko.unwrap(valueAccessor()),
                data = val.hierarchy,
                colors = val.colors,
                nodes = element.sunburst.partition.nodes(data).filter(function (node) {
                    return node.dx > 0.005; // 0.29 degrees
                });

            var path = element.sunburst.container.data([data]).selectAll('path')
                .data(nodes);

            path.exit().remove();
            path.enter().append('path')
                .attr('display', function(d) { return d.depth ? null : 'none'; })
                .attr('d', element.sunburst.arc)
                .attr('fill-rule', 'evenodd')
                .style('fill', function(d) { return colors[d.name]; })
                .style('opacity', 1)
                .on('mouseover', hoverPath.bind(element.sunburst));

            // Get total size of the tree = value of root node from partition.
            element.sunburst.totalSize = path.node().__data__.value;
        }
    };
});
