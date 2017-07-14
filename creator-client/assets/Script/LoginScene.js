let pomeloBuild = require("pomeloBuild");

const reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
const LOGIN_ERROR = "There is no server to log in, please wait.";
const LENGTH_ERROR = "Name/Channel is too long or too short.\n 20 character max.";
const NAME_ERROR = "Bad character in Name/Channel.\n Can only have letters,\n numbers, Chinese characters, and '_'";
const DUPLICATE_ERROR = "Please change your name to login.";
const SEVER_ERROR = "Server error.";
const LOGIN_SUCCESS = "Login success.";

cc.Class({
    extends: cc.Component,

    properties: {
        eb_name: cc.EditBox,
        eb_channel: cc.EditBox,
    },

    // use this for initialization
    onLoad: function () {
        pomeloBuild.create();
		pomelo.on("io-error", (event)=>{
			this.show_tip(SEVER_ERROR);
		});
    },

    on_click_login: function () {
        let username = this.eb_name.string;
        let rid = this.eb_channel.string;
        if(username.length > 20 || username.length == 0 || rid.length > 20 || rid.length == 0) {
			this.show_tip(LENGTH_ERROR);
			return;
		}
        if(!reg.test(username) || !reg.test(rid)) {
			this.show_tip(NAME_ERROR);
			return;
		}
        this.query_entry(username, (host, port)=>{
			pomelo.init({
				host: host,
				port: port,
				log: true
			}, ()=>{
				let route = "connector.entryHandler.enter";
				pomelo.request(route, {
					username: username,
					rid: rid
				}, (data)=>{
					if(data.error) {
                        this.show_tip(DUPLICATE_ERROR);
						return;
					}
					this.show_tip(LOGIN_SUCCESS);
                    window.users = data.body.users;
					window.user_name = username;
					window.rid = rid;
					cc.director.loadScene("chat_scene");
				});
			});
		});
    },

    query_entry: function(uid, callback) {
	    let route = 'gate.gateHandler.queryEntry';
	    pomelo.init({
		    host: "127.0.0.1",
		    port: 3014,
		    log: true
	    }, ()=>{
		    pomelo.request(route, {
			    uid: uid
		    }, (data)=>{
			    pomelo.disconnect();
			    if(data.body.code === 500) {
				    this.show_tip(LOGIN_ERROR);
				    return;
			    }
		    	callback(data.body.host, data.body.port);
	    	});
    	});
    },

    show_tip: function(msg) {
        let node = new cc.Node();
        node.x = cc.winSize.width/2;
        node.y = cc.winSize.height/2;
        let label_component = node.addComponent(cc.Label);
		label_component.string = msg;
		label_component.fontSize = 30;
		label_component.lineHeight = 40;
        node.runAction(cc.sequence(cc.moveBy(1,0,100),cc.removeSelf()));
        cc.game.addPersistRootNode(node);
    }
});
