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

    var _ = require('lodash');

    function Sitematrix() {}

    // this will be a promise to the loaded cache
    Sitematrix.loaded = null;

    /**
     * Fetch the sitematrix and keep the cache in a promise for anyone who needs it
     */
    Sitematrix.prototype.loadCache = function (config) {
        if (Sitematrix.loaded === null) {
            // in the special case when project is "all", resolve to "all-projects"
            var cache = {
                'all': 'all-projects',
                'all-projects':'all-projects'
            };

            Sitematrix.loaded = new $.Deferred();

            $.ajax({
                url: config.sitematrix.endpoint,
                // Tell jQuery we're expecting JSONP
                dataType: 'jsonp',
                //otherwise jquery takes the liberty of not caching your jsonp requests
                cache: true

            }).done(function (data) {
                // transform sitematrix in structure that allows easy o(1) lookups
                _.forEach(data.sitematrix, function (languageGroup) {
                    // special projects like commons are reported differently
                    var next = languageGroup.site || languageGroup;

                    _.forEach(next, function (site) {
                        // Each site record is as explained in this module comment
                        var urlEndpoint = site.url.replace(/https:\/\/(www\.)?/, '');
                        cache[site.dbname] = urlEndpoint;
                        cache[urlEndpoint] = site.dbname;
                    });
                });

            // fail or succeed, we resolve with the cache to make lookups easy
            }).then(function () {
                Sitematrix.loaded.resolve(cache);
            });
        }

        return Sitematrix.loaded.promise();
    };

    /**
     * Given a project db will return the project url as defined in teh sitematrix
     * If url is not found it will throw an error
     *
     * Jsonp request for sitematrix, wikimedia api doesn't allow CORS
     * from non-whitelisted domains
     */
    Sitematrix.prototype.getProjectUrl = function (config, dbname) {
        var urlPromise = new $.Deferred();

        this.loadCache(config).then(function (cache) {
            var found = cache[dbname];

            if (found) {
                urlPromise.resolve(found);
            } else {
                urlPromise.reject('Could not find url for project!');
            }
        });

        return urlPromise.promise();
    };

    return new Sitematrix();
});
