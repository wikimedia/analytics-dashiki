'use strict';

if (typeof window === 'undefined') {
    module.exports = {
        optimizerConfig: {
            include: [
                'requireLib',
                'components/layouts/metrics-by-project/metrics-by-project',
                'components/visualizers/wikimetrics/wikimetrics',
                'components/selectors/metric/metric',
            ],
            bundles: {
                // If you want parts of the site to load on demand, remove them from the 'include' list
                // above, and group them into bundles here.
                'out-of-service':       ['components/layouts/out-of-service/out-of-service'],
                'project-selector':     ['components/selectors/project/project'],
                'dygraphs-timeseries':  ['components/visualizers/dygraphs-timeseries/dygraphs-timeseries'],
                'breakdown-toggle':     ['components/controls/breakdown-toggle/breakdown-toggle'],
            }
        }
    };
}
