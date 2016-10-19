/**
 * This module returns a method that knows how to parse rows of the form
 * (<date>, <value1>, <value2>, ..., <valueN>, <size>) into a hierarchy
 * that can be laid out in partitions.
 *
 * It requires the parameter getHierarchyPath to be passed. It should be
 * a function that receives a row (array) of input data, and returns
 * another array containing the path of the hierarchy for that row.
 *
 * Example with traffic breakdown report:
 *     ['2016-01-01', 'iOS', '9', 'Mobile Safari', '9', 75432],
 *     ['2016-01-01', 'Windows', '7', 'Chrome', '47', 56308],
 *     ['2016-01-02', 'Android', '5', 'Chrome Mobile', '47', 30554],
 *     ['2016-01-02', 'Windows', '7', 'IE', '11', 28062],
 *     ...
 * The getHierarchyPath function would just return the 2nd, 3rd, ... Nth-1
 * elements of the array, i.e.: ['iOS', '9', 'Mobile Safari', '9'].
 *
 * Example with funnel visualization:
 *     ['2015-01-01', 'path-separated-by-dashes', 123],
 *     ['2015-01-01', 'path-separated-by-dashes-next-step', 234],
 *     ['2015-01-02', 'path-separated-by-dashes', 12],
 *     ...
 * The getHierarchyPath function would split the middle column by '-' and
 * return the resulting array, i.e.: ['path', 'separated', 'by', 'dashes'].
 */
'use strict';
define(function () {

    var _ = require('lodash');

    return function (tsv, getHierarchyPath) {
        var root = {name: 'root', children: []};

        // Using lodash because of its better performance,
        // some input files can be big.
        _.forEach(tsv, function (row) {
            var hierarchyPath = getHierarchyPath(row),
                size = +row[row.length - 1],
                currentNode = root;

            if (isNaN(size)) { return; }

            _.forEach(hierarchyPath, function (name, index) {
                name = name.toString();
                var last = (index === hierarchyPath.length - 1),
                    existing = currentNode.children.find(function (child) {
                        return child.name === name;
                    });

                if (existing) {
                    if (last) {
                        existing.size = (existing.size || 0) + size;
                    } else {
                        currentNode = existing;
                    }
                } else {
                    var nextNode = {name: name};
                    currentNode.children = currentNode.children || [];
                    currentNode.children.push(nextNode);

                    if (last) {
                        nextNode.size = size;
                    } else {
                        nextNode.children = [];
                        currentNode = nextNode;
                    }
                }
            });
        });

        return root;
    };
});
