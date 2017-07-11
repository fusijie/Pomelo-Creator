cc.Class({
    extends: cc.Component,

    properties: {
        eb_text: cc.EditBox,
        sv_name_content: cc.Node,
        sv_name_item: cc.Node,
        sv_chat_content: cc.Node,
        sv_chat_item: cc.Node,
        sv_chat_scrollview: cc.ScrollView,

        sf_btn_normal: cc.SpriteFrame,
        sf_btn_pressed: cc.SpriteFrame,

        lb_desc: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        if (!window.users) {
            //从登陆场景进
            cc.director.loadScene("login_scene");
            return;
        }

        this.sv_name_item.parent = null;
        this.sv_chat_item.parent = null;

        this.add_user("*");

        window.users.forEach((user) => {
            this.add_user(user);
        });

        this.choose_item("*");

        pomelo.on('onChat', (data) => {
            this.add_message(data.body.from, data.body.target, data.body.msg);
        });

        pomelo.on('onAdd', (data) => {
            let user = data.body.user;
            this.show_tip(user + " is online now.");
            this.add_user(user);
        });

        pomelo.on('onLeave', (data) => {
            let user = data.body.user;
            this.show_tip(user + " is offline now.");
            this.remove_user(user);
        });

        pomelo.on('disconnect', (reason) => {
            this.show_tip("Disconnect with the server.");
            cc.director.loadScene("login_scene");
        });

        let desc_text = "";
        desc_text += `Channel: ${window.rid} || `;
        desc_text += `User: ${window.user_name} || `;
        desc_text += `Pemolo: v2.2.5 || `;
        desc_text += `CocosCreator: v1.5`;
        this.lb_desc.string = desc_text;
    },

    send_msg: function () {
        var route = "chat.chatHandler.send";
        var msg = this.eb_text.string;
        var target = this.current_choose_user;
        pomelo.request(route, {
            rid: window.rid,
            content: msg,
            from: window.user_name,
            target: target
        }, (data) => {
            if(target !== "*" && target !== window.user_name) {
                this.add_message(window.user_name, target, msg);
            }
        });
        this.eb_text.string = "";
    },

    add_message: function (from, target, msg) {
        target = target === "*" ? "All" : target;
        let _sv_chat_item = cc.instantiate(this.sv_chat_item);
        let t = new Date();
        let text_content = "";
        let from_color = from === window.user_name ? `<color=#f4606c>` : `<color=#beedc7>`;
        let target_color = target === window.user_name ? `<color=#f4606c>` : `<color=#beedc7>`;
        text_content += `<color=#a0eee1>[${t.toLocaleTimeString()}] </c>`;
        text_content += `${from_color}${from}</c>`;
        text_content += ` say to `;
        text_content += `${target_color}${target}:</c> `;
        text_content += `<color=#222222>${msg}</c>`;
        _sv_chat_item.getComponent(cc.RichText).string = text_content;
        _sv_chat_item.parent = this.sv_chat_content;
        this.scroll_to_bottom();
    },

    scroll_to_bottom: function() {
        let item_height = this.sv_chat_item.height;
        let item_count = this.sv_chat_content.children.length;
        let sv_chat_content_layout_top = this.sv_chat_content.getComponent(cc.Layout).paddingTop;
        let sv_chat_content_layout_spacingY = this.sv_chat_content.getComponent(cc.Layout).spacingY;
        let total_height = sv_chat_content_layout_top + (item_height + sv_chat_content_layout_spacingY) * item_count;
        if (total_height > this.sv_chat_scrollview.node.height) {
            this.sv_chat_scrollview.scrollToBottom();
        }
    },

    add_user: function (user) {
        if (user === window.user_name) {
            return;
        }
        let is_exist = false;
        for (let i = 0; i < this.sv_name_content.children.length; i++) {
            if (this.sv_name_content.children[i].id === user) {
                is_exist = true;
            }
        }
        if (!is_exist) {
            let _sv_name_item = cc.instantiate(this.sv_name_item);
            _sv_name_item.id = user;
            let user_name = user === "*" ? "All" : user;
            _sv_name_item.getChildByName("button").getComponent(cc.Button).clickEvents[0].customEventData = user;
            _sv_name_item.getChildByName("label").getComponent(cc.Label).string = user_name;
            _sv_name_item.parent = this.sv_name_content;
        }
    },

    remove_user: function (user) {
        for (let i = 0; i < this.sv_name_content.children.length; i++) {
            if (this.sv_name_content.children[i].id === user) {
                this.sv_name_content.children[i].parent = null;
                break;
            }
        }
    },

    show_tip: function (msg) {
        let node = new cc.Node();
        node.x = cc.winSize.width / 2;
        node.y = cc.winSize.height / 2;
        let label_component = node.addComponent(cc.Label);
        label_component.string = msg;
        node.runAction(cc.sequence(cc.moveBy(1, 0, 100), cc.removeSelf()));
        cc.game.addPersistRootNode(node);
    },

    on_click_user: function(sender, data) {
        this.choose_item(data);
    },

    choose_item: function(user) {
        let item = null;
        this.sv_name_content.children.forEach((_item)=>{
            _item.getChildByName("sprite").getComponent(cc.Sprite).spriteFrame = this.sf_btn_normal;
            if (_item.id === user) {
                item = _item;
            }
        });
        item.getChildByName("sprite").getComponent(cc.Sprite).spriteFrame = this.sf_btn_pressed;
        this.current_choose_user = user;
    },
});
