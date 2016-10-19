/**
 * Mdule that gets the sitematrix and parses it.
 * Site matrix location is on config.js
 * Once initialized this class is just a singleton that holds an application scoped cache

 * https://meta.wikimedia.org/w/api.php?action=sitematrix&formatversion=2&format=json&&maxage=3600&smaxage=3600

 * Format:
 * {"sitematrix":{"count":894,
 * "0":{"code":"aa","name":"Qafár af","
    site":[{"url":"https://aa.wikipedia.org","dbname":"aawiki","code":"wiki","sitename":"Wikipedia","closed":""},{"url":"https://aa.wiktionary.org","dbname":"aawiktionary","code":"wiktionary","sitename":"Wiktionary","closed":""},{"url":"https://aa.wikibooks.org","dbname":"aawikibooks","code":"wikibooks","sitename":"Wikibooks","closed":""}],"localname":"Afar"},
 * "1":{"code":"ab","name":"Аҧсшәа",
    "site":[{"url":"https://ab.wikipedia.org","dbname":"abwiki","code":"wiki","sitename":"Авикипедиа"},
 *
 */
'use strict';
define(function (require) {

    var _ = require('lodash'),
        logger = require('logger');


    function Sitematrix() {}

    Sitematrix.cache = null;

    /**
     * Given a project db will return the project url as defined in teh sitematrix
     * If url is not found it will throw an error
     *
     * Jsonp request for sitematrix, wikimedia api doesn't allow CORS
     * from non-whitelisted domains
     */
    Sitematrix.prototype.getProjectUrl = function (config, dbname) {
        var endpoint = config.sitematrix.endpoint;
        var deferred = new $.Deferred();

        if (Sitematrix.cache) {
            var projectUrl = Sitematrix.cache[dbname];

            if (projectUrl) {
                deferred.resolve(projectUrl);
            } else {
                deferred.reject('Could not find url for project!');
            }

        } else {


            $.ajax({
                    url: endpoint,
                    // Tell jQuery we're expecting JSONP
                    dataType: 'jsonp',
                    //otherwise jquery takes the liberty of not caching your jsonp requests
                    cache: true

                }).done(function (data) {
                    // transform sitematrix in structure that allows easy o(1) lookups
                    var sitematrix = {};
                    _.forEach(data.sitematrix, function (languageGroup) {
                        // special projects like commons are reported differently
                        var next;
                        if (languageGroup.site) {
                            next = languageGroup.site;

                        } else {
                            next = languageGroup;
                        }
                        _.forEach(next, function (site) {


                            /*
                            Each site record is like:
                            closed: ''
                            code: 'wiki'
                            dbname: 'aawiki'
                            sitename: 'Wikipedia'
                            url: 'https://aa.wikipedia.org'
                            url needs to be transform to: aa.wikipedia
                            */
                            var urlEndpoint = site.url.replace(/https:\/\/(www\.)?/, '');
                            //building lookup both ways
                            sitematrix[site.dbname] = urlEndpoint;
                            sitematrix[urlEndpoint] = site.dbname;

                        });

                    });
                    // can we populate an application wide cache now? or is this bad practice?
                    if (!Sitematrix.cache) {
                        // there is a special case where project is "all"
                        // in that case that translates to "all-projects"
                        sitematrix.all = 'all-projects';
                        Sitematrix.cache = sitematrix;
                    }

                    if (sitematrix[dbname]) {
                        deferred.resolve(sitematrix[dbname]);
                    } else {
                        deferred.reject('Could not find url for project!');
                    }
                })
                .fail(function (error) {

                    logger.error(error);
                    deferred.reject(error);
                });

        }

        return deferred.promise();
    };



    return new Sitematrix();
});