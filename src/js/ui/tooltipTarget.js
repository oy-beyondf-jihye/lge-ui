vcui.define('ui/tooltipTarget', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    var TooltipTarget = core.ui('TooltipTarget', /** @lends vcui.ui.TooltipTarget# */{
        $singleton: true,
        bindjQuery: 'tooltipTarget',
        defaults: {
            interval: 200,
            tooltip: null
        },
        initialize: function initialize(el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self._bindEvents();
        },

        _bindEvents: function _bindEvents() {
            var self = this;
            self.$tooltip = self.$el.siblings(self.options.tooltip);

            self.on('mouseenter mouseleave focusin focusout click', function (e) {

                switch (e.type) {
                    case 'mouseenter':
                    case 'focusin':
                    case 'click':
                        if(!self.options.tooltip) return;
                        self.showTimer = setTimeout(function () {
                            self.$el.parent(".tooltip-wrap").addClass('active');
                            self.$tooltip.fadeIn('fast');
                            self.$tooltip.attr('aria-hidden', 'false');
                            self.isShow = true;
                        }, self.options.interval);
                        break;
                    case 'mouseleave':
                    case 'focusout':
                        self._close();
                        break;
                }
            }).on('mousedown', function () {
                self._close();
            });
        },
        _close: function _close(effect) {
            var self = this;
            clearTimeout(self.showTimer);
            clearTimeout(self.hideTimer);
            self.hideTimer = self.showTimer = null;

            if (!self.isShow) {
                return;
            }
            self.isShow = false;

            if (effect) {
                self.$tooltip.fadeOut('fast');
            } else {
                self.$tooltip.hide();
            }
            self.$tooltip.attr('aria-hidden', 'true');
            self.$el.parent(".tooltip-wrap").removeClass('active');
        }
    });

    return TooltipTarget;
});