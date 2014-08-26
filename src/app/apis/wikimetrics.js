/**
 * This module returns an instance of an object that knows how to get
 *   reports run by WikimetricsBot on wikimetrics.  Methods commented inline
 */
define(['config', 'uri/URI', 'uri/URITemplate'], function( siteConfig, uri) {

    function WikimetricsApi(config) {
        this.root = config.wikimetricsDomain;
    }

    /**
     * Parameters
     *   metric  : a Wikimetrics metric
     *   project : a Wiki project (English Wikipedia is 'enwiki', Commons is 'commonswiki', etc.)
     *
     * Returns
     *   a jquery promise that is fetching the correct URL for the parameters passed in
     */
    WikimetricsApi.prototype.get = function(metric, project) {
        var address = uri.expand('https://{root}/static/public/datafiles/{metric}/{project}.json', {
            root    : this.root,
            metric  : metric,
            project : project,
        }).toString();
        return $.get(address);
    };

    return new WikimetricsApi(siteConfig);
});
