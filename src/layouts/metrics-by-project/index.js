'use strict';

if (typeof window === 'undefined') {
    module.exports = {
        optimizerConfig: {
            include: [
                'requireLib',
                'components/wikimetrics-visualizer/wikimetrics-visualizer',
                'components/wikimetrics-layout/wikimetrics-layout',
                'components/metric-selector/metric-selector',
                'components/time-selector/time-selector'
            ],
            bundles: {
                // If you want parts of the site to load on demand, remove them from the 'include' list
                // above, and group them into bundles here.
                'project-selector': ['components/project-selector/project-selector'],
                'vega-timeseries': ['components/visualizers/vega-timeseries/vega-timeseries'],
                'breakdown-toggle': ['components/breakdown-toggle/breakdown-toggle'],
                'annotation-list': ['components/annotation-list/annotation-list']
            }
        }
    };
}
