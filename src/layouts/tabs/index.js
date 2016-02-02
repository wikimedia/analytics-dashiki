'use strict';

if (typeof window === 'undefined') {
    module.exports = {
        optimizerConfig: {
            include: [
                'requireLib',
                'components/tabs-layout/tabs-layout',
                'components/visualizers/visualizer/visualizer',
            ],
            bundles: {
                // If you want parts of the site to load on demand, remove them from the 'include' list
                // above, and group them into bundles here.
                'sunburst': ['components/visualizers/sunburst/sunburst'],
                'stacked-bars': ['components/visualizers/stacked-bars/stacked-bars'],
                'dygraphs-timeseries': ['components/visualizers/dygraphs-timeseries/dygraphs-timeseries'],
                'filter-timeseries': [
                    'components/visualizers/filter-timeseries/filter-timeseries',
                    'components/visualizers/dygraphs-timeseries/dygraphs-timeseries'
                ],
                'table-timeseries': ['components/visualizers/table-timeseries/table-timeseries'],
            }
        }
    };
}
