'use strict';
define(function (require) {
    var ko = require('knockout');

    /**
     * Convention-based binding that expects html like this:
     *   <div data-bind="toggle: 'observableName'">... style this as the trigger that toggles ...</div>
     *   <div class="... target">... style this as the target that is being toggled ...</div>
     *
     * With this setup, clicking on the trigger will cause the target to toggle on and off
     *   an observable named "observableName" in the bindingContext.$data
     * Also, the target will be turned off if the user clicks outside of it
     */
    function Toggle(element, observable) {
        this.trigger = element;
        this.observable = observable;
    }
    ko.bindingHandlers.toggle = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var open = ko.observable(false),
                observableName = valueAccessor(),
                toggle = new Toggle(element, open);

            $(element).addClass(ko.bindingHandlers.toggle.triggerClass);

            // add an observable named according to the binding
            bindingContext.$data[observableName] = open;
            ko.bindingHandlers.toggle.toggles.push(toggle);

            // make sure to remove the toggle when the element is disposed,
            // otherwise the event handler below would use it forever
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                ko.utils.arrayRemoveItem(ko.bindingHandlers.toggle.toggles, toggle);
            });

            return {
                controlsDescendantBindings: false
            };
        }
    };
    ko.bindingHandlers.toggle.toggles = [];
    ko.bindingHandlers.toggle.targetClass = 'target';
    ko.bindingHandlers.toggle.targetSelector = '.target';
    ko.bindingHandlers.toggle.triggerClass = 'trigger';
    ko.bindingHandlers.toggle.triggerSelector = '.trigger';

    $(window).on('click', function (event) {
        var toggles = ko.bindingHandlers.toggle.toggles,
            hitTarget,
            hitTrigger;

        if (!toggles || !toggles.length) {
            return;
        }

        hitTarget = $(event.target).closest(ko.bindingHandlers.toggle.targetSelector);
        if (hitTarget && hitTarget.length) {
            return;
        }

        hitTrigger = $(event.target).closest(ko.bindingHandlers.toggle.triggerSelector);
        // if a trigger was hit, find it in the cached toggle array and toggle it
        if (hitTrigger && hitTrigger.length) {

            var toggle, i;

            for (i = 0; i < toggles.length; i++) {
                if (toggles[i].trigger === hitTrigger[0]) {
                    toggle = toggles[i];
                    break;
                }
            }

            if (toggle) {
                toggle.observable(!toggle.observable());
            }
            return;
        }

        // if no target and no trigger was clicked, close all targets through their observables
        toggles.forEach(function (t) {
            t.observable(false);
        });
    });
});
