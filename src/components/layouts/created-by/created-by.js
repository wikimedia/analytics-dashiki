'use strict';
/**
 * To explains how this dashboard was created, link to documentation for:
 *   * Dashiki
 *   * the configuration for this dashboard
 **/
define(function (require) {

    var templateMarkup = require('text!./created-by.html'),
        config = require('config');

    function CreatedBy() {
        this.link = config.configApi.dashboardConfigLink || 'http://meta.wikimedia.org/wiki/Config:Dashiki:Sample/tabs';
        this.name = config.configApi.dashboardArticle || 'on-wiki config (loaded at build-time)';
    }
    return {
        viewModel: CreatedBy,
        template: templateMarkup
    };
});
