'use strict';

if (typeof window === 'undefined') {
    module.exports = {
        optimizerConfig: {
            include: [
                'requireLib',
                'components/layouts/compare/compare',
                'components/controls/dropdown/dropdown',
                'components/controls/button-group/button-group',
                'components/controls/button-group/button-group',
                'components/visualizers/a-b-compare/a-b-compare',
                'components/visualizers/a-b-compare/compare-sunburst',
                'components/visualizers/a-b-compare/compare-timeseries',
                'components/visualizers/a-b-compare/compare-stacked-bars',
            ],
            bundles: {
                // If you want parts of the site to load on demand, remove them from the 'include' list
                // above, and group them into bundles here.
                'out-of-service':   ['components/layouts/out-of-service/out-of-service'],
                'sunburst':         ['components/visualizers/sunburst/sunburst'],
                'stacked-bars':     ['components/visualizers/stacked-bars/stacked-bars'],
                'filter-timeseries': [
                    'components/visualizers/filter-timeseries/filter-timeseries',
                    'components/visualizers/dygraphs-timeseries/dygraphs-timeseries'
                ],
            }
        }
    };
}
