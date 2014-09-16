/**
 * Mock window module to ease testing
 **/
define(function () {

    function MockWindow() {}

    MockWindow.prototype.location = {

        assign: function () {
            // no op, mock to make sure we are not changing location of tests
        }

    }


    return new MockWindow();
});
