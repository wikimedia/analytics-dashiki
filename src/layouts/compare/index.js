'use strict';

if (typeof window === 'undefined') {
    module.exports = {
        optimizerConfig: {
            include: [
                'requireLib',
                'components/compare-layout/compare-layout',
                'components/dropdown/dropdown',
                'components/button-group/button-group',
                'components/button-group/button-group',
                'components/a-b-compare/a-b-compare',
                'components/a-b-compare/compare-sunburst',
                'components/a-b-compare/compare-timeseries',
                'components/a-b-compare/compare-stacked-bars',
            ],
            bundles: {
                // If you want parts of the site to load on demand, remove them from the 'include' list
                // above, and group them into bundles here.
                'out-of-service' :['components/out-of-service/out-of-service'],
                'sunburst': ['components/visualizers/sunburst/sunburst'],
                'stacked-bars': ['components/visualizers/stacked-bars/stacked-bars'],
                'filter-timeseries': [
                    'components/visualizers/filter-timeseries/filter-timeseries',
                    'components/visualizers/dygraphs-timeseries/dygraphs-timeseries'
                ],
            }
        }
    };
}
