var Constants = require('Constants');
const STAND = Constants.STAND
const GAME_STATE = Constants.GAME_STATE;

cc.Class({
    extends: cc.Component,

    properties: {
        card: ''
    },

    // use this for initialization
    onLoad: function() {
        this.selected = false;
        this.anim = this.getComponent(cc.Animation);
    },

    onClicked: function() {
        if (G.gameManager.gameState == GAME_STATE.PREPARE) {
            if (this.selected === false) {
                this.playAnim();

                var event = new cc.Event.EventCustom('cardSelect', true);
                event.setUserData(this);
                this.node.dispatchEvent(event);
                console.log('select');

            } else {
                this.stopAnim();

                this.node.dispatchEvent(new cc.Event.EventCustom('cardUnSelect', true));
                console.log('unselect');
            }
        } else {
            console.log('unsuitable');
        }
    },

    playAnim: function() {
        this.anim.play();
        this.selected = true;
    },

    stopAnim: function() {
        this.anim.stop();
        this.selected = false;
        this.node.color = cc.Color.WHITE;
    },

    discardAnim: function() {
        var self = this;
        var finishedDiscard = cc.callFunc(function() {
            self.node.active = false;
            self.node.parent.getComponent('pile').popCard();
            console.log('hello world');
            if (G.gameManager.turn == STAND.BLACK) {
                G.gameManager.gameState = GAME_STATE.PLAYING;
            }
        }, this, null)
        this.node.runAction(cc.sequence(cc.fadeOut(0.5), finishedDiscard));
    },

    pkAnim: function(type, aCard, handle) {
        if (type === 'MyCards') {
            var pos0 = this.node.position;
            var pos1 = this.node.parent.convertToNodeSpaceAR(cc.v2(160, 400));
            var seq;
            if (handle === 'back') {
                seq = cc.sequence(cc.moveTo(0.5, pos1.x, pos1.y), cc.delayTime(2.4), cc.moveTo(0.5, pos0.x, pos0.y));
            } else if (handle === 'discard') {
                var self = this;
                var finishedDiscard = cc.callFunc(function() {
                    self.node.active = false;
                    self.node.parent.getComponent('pile').popCard();
                }, this, null)
                seq = cc.sequence(cc.moveTo(0.5, pos1.x, pos1.y), cc.delayTime(2.2), cc.fadeOut(0.7), finishedDiscard);
            } else if ((handle === 'win') || (handle === 'lose')) {
                seq = cc.moveTo(0.5, pos1.x, pos1.y);
            }
            this.node.runAction(seq);
        } else if (type === 'HisCards') {
            var pos0 = this.node.position;
            var pos1 = this.node.parent.convertToNodeSpaceAR(cc.v2(300, 400));
            var self = this;

            var finishedIn = cc.callFunc(function() {
                cc.loader.loadRes('Card/' + aCard, cc.SpriteFrame, function(err, spriteFrame) {
                    self.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
            }, this, null);

            var finishedout = cc.callFunc(function() {
                cc.loader.loadRes('Card/Back', cc.SpriteFrame, function(err, spriteFrame) {
                    self.node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
            }, this, null);

            var finishedStateChange = cc.callFunc(function() {
                if (G.gameManager.turn == STAND.BLACK) {
                    G.gameManager.gameState = GAME_STATE.PLAYING;
                }
            }, this, null)

            var finishedDiscard = cc.callFunc(function() {
                self.node.active = false;
                self.node.parent.getComponent('pile').popCard();
            }, this, null)

            var seq;
            if (handle === 'back') {
                seq = cc.sequence(cc.moveTo(0.5, pos1.x, pos1.y), cc.scaleTo(0.1, 0, 0.07), finishedIn, cc.scaleTo(0.1, 0.07, 0.07), cc.delayTime(2),
                    cc.scaleTo(0.1, 0, 0.07), finishedout, cc.scaleTo(0.1, 0.07, 0.07), cc.moveTo(0.5, pos0.x, pos0.y), finishedStateChange);
            } else if (handle === 'discard') {
                seq = cc.sequence(cc.moveTo(0.5, pos1.x, pos1.y), cc.scaleTo(0.1, 0, 0.07), finishedIn, cc.scaleTo(0.1, 0.07, 0.07), cc.delayTime(2),
                    cc.fadeOut(0.7), finishedDiscard, finishedStateChange);
            } else if ((handle === 'win') || (handle === 'lose')) {
                seq = cc.sequence(cc.moveTo(0.5, pos1.x, pos1.y), cc.scaleTo(0.1, 0, 0.07), finishedIn, cc.scaleTo(0.1, 0.07, 0.07));
                if (handle === 'win') {
                    G.gameManager.gameOver('lose');
                } else {
                    G.gameManager.gameOver('win');
                }
            }
            this.node.runAction(seq);
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});