var Constants = require('Constants');
const URL = Constants.URL;
const STAND = Constants.STAND
const GAME_STATE = Constants.GAME_STATE;
cc.Class({
    extends: cc.Component,

    properties: {
        pile: '',
        parent: '',
    },

    // use this for initialization
    onLoad: function() {
        this.cardCount = 5;
        this.topCard = this.node.getChildByName(this.cardCount.toString());;
    },

    onPileClicked: function() {
        if ((G.gameManager.gameState == GAME_STATE.PLAYING) && (G.gameManager.turn == STAND.BLACK)) {
            if (this.getCardName() === 'S') {
                return;
            }
            if (this.parent === 'MyCards') {
                this.topCard.getComponent('Card').playAnim();
            }
            var event = new cc.Event.EventCustom('pileSelect', true);
            event.setUserData(this);
            this.node.dispatchEvent(event);
        }
    },

    popCard: function() {
        this.cardCount--;
        this.topCard = this.node.getChildByName(this.cardCount.toString());;
    },

    getCard: function() {
        return this.topCard;
    },

    getCardName: function() {
        return this.topCard.getComponent('Card').card;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});