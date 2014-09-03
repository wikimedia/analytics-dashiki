/**
 * This module returns a method that knows how to translate json data from
 *   wikimetrics to the canonical timeseries format understood by dashiki
 */
define(['moment'], function(moment) {

    /**
     * Parameters
     *   defaultSubmetrics  : keys: metric names, values: default submetric to use
     *   rawData            : Wikimetrics json data, as fetched from a Wikimetrics
     *                        public report result file
     *
     * Returns
     *   A sorted array of objects in canonical dashiki timeseries format:
     *   {
     *       date    : -- getTime called on a date object --
     *       label   : -- in this case the cohort --
     *       value   : -- the value of the default submetric, see "submetrics" below --
     *   }
     *
     * NOTE: if implementing a similar converter, keep in mind it's important to
     *       convert dates to the unix milliseconds format (getTime).  This is
     *       so that Vega doesn't have to parse the date into a datetime.  If you
     *       rely on Vega to do the parsing, it will be done more frequently, on
     *       all data updates.  Also, it will mutate the property which has caused
     *       some unexpected knockout dependency triggering in some cases.
     */
    return function (defaultSubmetrics, rawData){
        var aggregate = 'Sum',
            normalized = [],
            keys = Object.keys(rawData),
            parameters = rawData.parameters,
            metricName = parameters.Metric,
            submetric = defaultSubmetrics[metricName],
            i;

        keys.splice(keys.indexOf('parameters'), 1);
        if (keys.indexOf('result') >= 0){
            keys = Object.keys(rawData.result[aggregate][submetric]);
            for (i=0; i<keys.length; i++) {
                normalized.push({
                    date: moment(keys[i]).toDate().getTime(),
                    label: parameters.Cohort,
                    value: rawData.result[aggregate][submetric][keys[i]]
                });
            }
        } else {
            for (i=0; i<keys.length; i++) {
                normalized.push({
                    date: moment(keys[i]).toDate().getTime(),
                    label: parameters.Cohort,
                    value: rawData[keys[i]][aggregate][submetric]
                });
            }
        }
        return normalized.sort(function(a, b){
            return a.date - b.date;
        });
    };
});
