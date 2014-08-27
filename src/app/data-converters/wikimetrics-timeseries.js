/**
 * This module returns a method that knows how to translate json data from
 *   wikimetrics to the canonical timeseries format understood by dashiki
 */
define(['moment', 'config'], function(moment, config) {

    /**
     * Parameters
     *   rawData : Wikimetrics json data, as fetched from a Wikimetrics public report result file
     *
     * Returns
     *   A sorted array of objects in canonical dashiki timeseries format:
     *   {
     *       date    : -- an instance of a date object --
     *       label   : -- in this case the cohort --
     *       value   : -- the value of the default submetric, see "submetrics" below --
     *   }
     */
    return function (rawData){
        var aggregate = 'Sum',
            normalized = [],
            keys = Object.keys(rawData),
            parameters = rawData.parameters,
            metricName = parameters.Metric,
            submetric = config.wikimetricsDefaultSubmetrics[metricName],
            i;

        keys.splice(keys.indexOf('parameters'), 1);
        if (keys.indexOf('result') >= 0){
            keys = Object.keys(rawData.result[aggregate][submetric]);
            for (i=0; i<keys.length; i++) {
                normalized.push({
                    date: moment(keys[i]).toDate(),
                    label: parameters.Cohort,
                    value: rawData.result[aggregate][submetric][keys[i]]
                });
            }
        } else {
            for (i=0; i<keys.length; i++) {
                normalized.push({
                    date: moment(keys[i]).toDate(),
                    label: parameters.Cohort,
                    value: rawData[keys[i]][aggregate][submetric]
                });
            }
        }
        return normalized.sort(function(a, b){
            return a.date.getTime() - b.date.getTime();
        });
    };
});
