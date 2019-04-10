odoo.define('web.progress.bar', function (require) {
"use strict";

/**
 * Display Progress Bar when blocking UI
 */

var core = require('web.core');
var Widget = require('web.Widget');
var session = require('web.session');
var framework = require('web.framework');

var _t = core._t;
var framework_blockUI = framework.blockUI;
var framework_unblockUI = framework.unblockUI;

var ProgressBar = Widget.extend({
    template: "ProgressBar",
    init: function() {
        this._super(parent);
        core.bus.on('rpc_progress', this, this.show_progress);
    },
    show_progress: function(progress_list) {
        var progress_html = "";
        var progress = 0;
        var progress_total = 100;
        var progress_code = -1;
        var cancellable = true;
        _.each(progress_list, function(el) {
            if (el.msg) {
                progress_html += "<div>" + _t("Progress") + " " +
                    el.progress + "%" + " (" + el.done + "/" + el.total + ")" + " " + el.msg + "</div>"
            }
            if (el.progress && el.total) {
                progress += el.progress * progress_total / 100;
            }
            progress_total /= el.total;
            progress_code = el.code;
            cancellable = cancellable && el.cancellable;
            });
        self.$("#progress_frame").css("visibility", 'visible');
        if (cancellable) {
            self.$("#progress_cancel").css("visibility", 'visible');
            self.$("#progress_cancel").one('click', function () {
                core.bus.trigger('rpc_progress_cancel', progress_code);
            });
        } else {
            self.$("#progress_cancel").remove();
        }
        self.$("#progress_bar").animate({width: progress + '%'}, 2100);
        if (progress_html) {
            self.$(".oe_progress_message").html(progress_html);
        }
        },
});

var progress_bars = [];

function blockUI() {
    var tmp = framework_blockUI();
    var progress_bar = new ProgressBar();
    progress_bars.push(progress_bar);
    progress_bar.appendTo($(".oe_blockui_spin_container"));
    return tmp;
}

function unblockUI() {
    _.invoke(progress_bars, 'destroy');
    progress_bars = [];
    return framework_unblockUI();
}

framework.blockUI = blockUI;
framework.unblockUI = unblockUI;

return {
    blockUI: blockUI,
    unblockUI: unblockUI,
    ProgressBar: ProgressBar,
};

});