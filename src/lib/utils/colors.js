'use strict';
define(function () {

    return {
        /**
         * Poor man's category10 scale from d3, for when you don't want to
         * import the whole library for a simple color scale
         */
        category10: function (domain, range) {
            range = range || [
                '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
                '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
            ];
            domain = domain || [];
            return function (x) {

                var index = domain.indexOf(x);
                if (index < 0) {
                    index = domain.push(x) - 1;
                }

                return range[index % range.length];
            };
        },
    };
});
