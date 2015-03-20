/**
 * This module returns a method that knows how to parse rows of the form:
 *      ['2015-01-01', 'path-separated-by-dashes', 123],
 *      ['2015-01-01', 'path-separated-by-dashes-next-step', 234]
 *      ['2015-01-02', 'path-separated-by-dashes', 12]
 *
 *   into a hierarcy that can be laid out in partitions
 */
define(function () {

    return function (tsv) {

        var root = {name: 'root', children: []};
        tsv.forEach(function (row) {
            var parts = row[1].split('-'),
                size = +row[2],
                currentNode = root;

            if (isNaN(size)) { return; }

            // limit path length to 10
            parts = parts.slice(0, 10);

            // Always end the path because if the partition layout saw these paths:
            //   A -> B -> C
            //   A -> B -> C -> D
            // it would not show the first one since C has other children.  So C needs
            // an "end" leaf child.  We can look into simulating this but it's harder
            parts.push('end');

            parts.forEach(function (name, i) {
                var last = i === parts.length - 1,
                    existing = currentNode.children &&
                               currentNode.children.find(function (n) {
                                   return n.name === name;
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

