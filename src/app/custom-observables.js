define(['knockout'], function (ko) {
    'use strict';

    /**
     * An extension function to create an observable that can
     *   be updated without notifying subscribers.  This should
     *   be used with care:
     *
     *   var a = ko.observable().withPause();
     *   a.pauseNotifyAndUpdate('new value');
     *   // do some more stuff before triggering notification
     *   ...
     *   // manually trigger notifications
     *   a.notifySubscribers();
     */
    ko.observable.fn.withPause = function() {
        this.notifySubscribers = function() {
           if (!this.pauseNotifications) {
              ko.subscribable.fn.notifySubscribers.apply(this, arguments);
           }
        };

        this.pauseNotifyAndUpdate = function(newValue) {
            this.pauseNotifications = true;
            this(newValue);
            this.pauseNotifications = false;
        };

        return this;
    };
});
