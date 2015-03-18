define(function(require) {

    var templateMarkup = require('text!./rickshaw-timeseries.html');

    require('./bindings');
    require('./rickshaw-extensions');

    function RickshawTime(params) {
        $.extend(this, params);
        this.colors = params.colors || {
            'init': '#5687d1',
            'ready': '#7b615c',
            'saveIntent': '#de783b',
            'saveAttempt': '#17becf',
            'saveSuccess': '#6ab975',
            'saveFailure': '#a173d1',
            'abort': '#bcbd22',
            'end': '#bbbbbb'
        };
        this.series = [{
            name: 'saveSuccess',
            color: this.colors.saveSuccess,
            renderer: 'dashed-line',
            data: [
                {x: 1426021179, y: 120},{x: 1426107579, y: 124},{x: 1426193979, y: 131},{x: 1426280379, y: 130},
                {x: 1426366779, y: 121},{x: 1426453179, y: 126},{x: 1426539579, y: 124},{x: 1426625979, y: 141}
            ]
        }];
    }

    return {
        viewModel: RickshawTime,
        template: templateMarkup
    };
});
