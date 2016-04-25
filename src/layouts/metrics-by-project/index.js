'use strict';

if (typeof window === 'undefined') {
    module.exports = {
        optimizerConfig: {
            include: [
                'requireLib',
                'components/visualizers/wikimetrics/wikimetrics',
                'components/metrics-by-project-layout/metrics-by-project-layout',
                'components/metric-selector/metric-selector'
            ],
            bundles: {
                // If you want parts of the site to load on demand, remove them from the 'include' list
                // above, and group them into bundles here.
                'out-of-service' :['components/out-of-service/out-of-service'],
                'project-selector': ['components/project-selector/project-selector'],
                'dygraphs-timeseries': ['components/visualizers/dygraphs-timeseries/dygraphs-timeseries'],
                'breakdown-toggle': ['components/breakdown-toggle/breakdown-toggle']
            }
        }
    };
}
