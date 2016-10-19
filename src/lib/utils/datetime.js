'use strict';
define(function (require) {

    var moment = require('moment');

    require('twix');

    return {
        timespan: function (a, b) {
            return moment(a).twix(b, {allDay: true}).format();
        },

        formatDate: function (d) {
            return d ? moment(d).format('YYYY-MM-DD') : '(invalid)';
        },
    };
});
