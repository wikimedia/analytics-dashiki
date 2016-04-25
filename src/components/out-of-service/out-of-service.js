'use strict';
/**
 * When a global config is set for this dashboard a message will
 * about the dashboard being out of service will pop out.
 * See config: https://meta.wikimedia.org/wiki/Dashiki:OutOfService
 **/
define(function (require) {

	var templateMarkup = require('text!./out-of-service.html'),
		ko = require('knockout'),
		configApi = require('apis.config');

	function OutOfServiceBanner() {
		this.isBannerOn = ko.observable(false);
		this.customMessage = ko.observable("");

		//request data and change out of banner state if proceeds
		configApi.getOutOfService(function (config) {
			if (config.outOfService === "true") {
				this.isBannerOn(true);
				this.customMessage(config.customMessage);
			}
		}.bind(this));
	}
	return {
		viewModel: OutOfServiceBanner,
		template: templateMarkup
	};
});