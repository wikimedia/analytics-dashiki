/**
 * This module gets metric annotations that reside in Mediawiki.
 * To get them, it uses mediawiki-storage library.
 */
'use strict';
define(function (require) {

    var mediawikiStorage = require('mediawiki-storage'),
        moment = require('moment'),
        logger = require('logger'),
        converter = require('converters.annotations'),
        TimeseriesData = require('models.timeseries');

    function AnnotationsApi () {}

    /**
     * Gets the annotations in a TimeseriesData format.  Important notes:
     *   1. range annotations (from date A to date B) come in as separate rows, prefixed
     *      with Start: [the note] and End: [the note]
     *   2. if duplicate dates are present, duplicateDates is set to true on the returned
     *      object.  Callers should keep this in mind since it disallows merges
     *
     * Parameters
     *   metric  : Metric object that has an annotations object:
     *             {
     *                 ...
     *                 annotations: {
     *                     host: 'mediawiki.host',
     *                     pageName: 'PageName'
     *                 },
     *                 ...
     *             }
     *
     * Returns
     *   A promise to a TimeseriesData instance with the annotations
     */
    AnnotationsApi.prototype.getTimeseriesData = function (metric) {

        var params = metric.annotations,
            deferred = new $.Deferred();

        if (!this.checkParams(params)) {
            deferred.resolve(new TimeseriesData());

        } else {
            mediawikiStorage.get({
                    host: params.host,
                    pageName: params.pageName
            }).done(function (data) {
                deferred.resolve(converter()({}, data));

            }).fail(function (error) {
                // resolve as done with empty results and log the error
                deferred.resolve(new TimeseriesData());
                logger.error(error);
            });
        }
        return deferred;
    };

    /**
     * Retrieves the annotations for the given metric, as written on the wiki
     *   but verified to be in the correct format
     *
     * Parameters
     *
     *   metric  : Metric object containing (or not) the following fields:
     *             {
     *                 ...
     *                 annotations: {
     *                     host: 'mediawiki.host',
     *                     pageName: 'PageName'
     *                 },
     *                 ...
     *             }
     *             If it contains this substructure, the method
     *             will try to get the data from mediawiki.
     *             Otherwise, it will return en empty list.
     *
     *   success : [optional] A function that will be called when finished
     *             with the resulting data as single parameter.
     *
     *   error   : [optional] A function that will be called in case
     *             of failure with the risen error as single parameter.
     *
     * Returns
     *
     *   A jquery promise where 'done' and 'fail' callbacks can be submitted.
     *   These, will receive the same parameters as success and error callbacks
     *   respectively. In case of success, this will be the annotation's format:
     *   [
     *       {
     *           start     : '2013-01-01 17:32:13',
     *           end       : '2014-02-02 03:55:08',
     *           note      : 'Annotation text.'
     *       },
     *       ...
     *   ]
     */
    AnnotationsApi.prototype.get = function (metric, success, error) {
        if (typeof metric !== 'object') {
            throw new TypeError('function must receive an object');
        }

        var params = metric.annotations,
            that = this,
            deferred = new $.Deferred();

        if (!this.checkParams(params)) {
            // accept metrics without annotation params
            // and just return an empty array
            deferred.resolve([]);

        } else {
            mediawikiStorage.get({
                host: params.host,
                pageName: params.pageName
            })
            .fail(deferred.reject)
            .done(function (data) {
                that.checkAnnotations(data, deferred, params);
            });
        }

        deferred.done(success);
        deferred.fail(error);
        return deferred.promise();
    };

    AnnotationsApi.prototype.checkParams = function (params) {
        return (
            typeof params === 'object' &&
            typeof params.host === 'string' &&
            typeof params.pageName === 'string'
        );
    };

    AnnotationsApi.prototype.checkDate = function (date) {
        return (
            date === void 0 ||
            typeof date === 'string' &&
            moment(date).isValid()
        );
    };

    AnnotationsApi.prototype.checkInterval = function (start, end) {
        // assumes both dates have passed checkDate
        return (
            start === void 0 ||
            end === void 0 ||
            moment(start) <= moment(end)
        );
    };

    AnnotationsApi.prototype.checkAnnotations = function (data, deferred, params) {
        if (!(data instanceof Array)) {
            var message = (
                'Mediawiki page with host "' + params.host +
                '" and page name "' + params.pageName +
                '" does not contain an array of annotations.'
            );
            logger.error(message);
            deferred.reject(new TypeError(message));

        } else {
            var that = this;

            // remove annotations that are incorrect
            var annotations = data.filter(function (annotation) {
                return (
                    typeof annotation === 'object' &&
                    that.checkDate(annotation.start) &&
                    that.checkDate(annotation.end) &&
                    that.checkInterval(annotation.start, annotation.end) &&
                    typeof annotation.note === 'string'
                );
            });

            deferred.resolve(annotations);
        }
    };

    return new AnnotationsApi();
});
