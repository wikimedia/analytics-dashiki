/**
 * This module gets metric annotations that reside in Mediawiki.
 * To get them, it uses mediawiki-storage library.
 */
define(['mediawiki-storage', 'moment', 'logger'], function (mediawikiStorage, moment) {
    'use strict';

    function AnnotationsApi () {}

    /**
     * Retrieves the annotations for the given metric.
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
            deferred = $.Deferred(),
            that = this;

        if (!this._checkParams(params)) {
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
                that._checkAnnotations(data, deferred, params);
            });
        }

        deferred.done(success);
        deferred.fail(error);
        return deferred.promise();
    };

    AnnotationsApi.prototype._checkParams = function (params) {
        return (
            typeof params === 'object' &&
            typeof params.host === 'string' &&
            typeof params.pageName === 'string'
        );
    };

    AnnotationsApi.prototype._checkDate = function (date) {
        return (
            date === void 0 ||
            typeof date === 'string' &&
            moment(date).isValid()
        );
    };

    AnnotationsApi.prototype._checkInterval = function (start, end) {
        // assumes both dates have passed _checkDate
        return (
            start === void 0 ||
            end === void 0 ||
            moment(start) <= moment(end)
        );
    };

    AnnotationsApi.prototype._checkAnnotations = function (data, deferred, params) {
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
                    that._checkDate(annotation.start) &&
                    that._checkDate(annotation.end) &&
                    that._checkInterval(annotation.start, annotation.end) &&
                    typeof annotation.note === 'string'
                );
            });

            deferred.resolve(annotations);
        }
    };

    return new AnnotationsApi();
});
