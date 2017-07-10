let pomeloBuild = require("pomeloBuild");

cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function () {
        pomeloBuild.create();
        this.label.string = this.text;
    },

    // called every frame
    update: function (dt) {

    },

    on_click_connect: function () {
        let host = "127.0.0.1";
        let port = "3010";
        pomelo.init({
            host: host,
            port: port,
            log: true
        }, (data) => {
            this.label.string = "连接 Pomelo 服务端成功";
        });
    },

    on_click_send_msg: function () {
        pomelo.request("connector.entryHandler.entry", "hello pomelo", (data) => {
            this.label.string = data.body.msg;
        });
    },
});
