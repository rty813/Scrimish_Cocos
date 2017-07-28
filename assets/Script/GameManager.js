var Constants = require('Constants');
const URL = Constants.URL;
const STAND = Constants.STAND
const GAME_STATE = Constants.GAME_STATE;

cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        myCards: {
            default: null,
            type: cc.Node,
        },
        btnDiscard: {
            default: null,
            type: cc.Node,
        }
    },

    onBtnReadyClicked: function() {
        this.pile1.getComponent(cc.Animation).play('SelectCardEnd1');
        this.pile2.getComponent(cc.Animation).play('SelectCardEnd2');
        this.pile3.getComponent(cc.Animation).play('SelectCardEnd3');
        this.pile4.getComponent(cc.Animation).play('SelectCardEnd4');
        this.pile5.getComponent(cc.Animation).play('SelectCardEnd5');
        this.node.getChildByName('btnReady').active = false;
        G.roomSocket.emit('ready', null);
        for (var i = 1; i <= 5; i++) {
            for (var j = 1; j <= 5; j++) {
                var card = cc.find('MyCards/pile' + i + '/' + j, this.node);
                card.getComponent('Card').stopAnim();
                card.getComponent(cc.Button).interactable = false;
            }
        }
        this.gameState = GAME_STATE.PLAYING;
    },

    onBtnDiscardClicked: function() {
        G.gameManager.selectPile1.getCard().getComponent('Card').stopAnim();
        G.gameManager.btnDiscard.active = false;
        G.gameManager.gameState = GAME_STATE.WAIT;
        G.gameManager.turn = STAND.WHITE;
        G.gameManager.selectPile1.getCard().getComponent('Card').discardAnim();
        G.roomSocket.emit('discard', G.gameManager.selectPile1.pile);
        G.gameManager.selectPile1 = null;
    },

    // use this for initialization
    onLoad: function() {
        G.gameManager = this;
        this.gameState = GAME_STATE.PREPARE;
        this.anim = this.label.getComponent(cc.Animation);
        this.pile1 = this.myCards.getChildByName('pile1');
        this.pile2 = this.myCards.getChildByName('pile2');
        this.pile3 = this.myCards.getChildByName('pile3');
        this.pile4 = this.myCards.getChildByName('pile4');
        this.pile5 = this.myCards.getChildByName('pile5');
        this.showInfo('请按照一定次序排放你的牌');
        this.turn = G.stand;
        this.selectNum = 0;
        this.node.on('cardSelect', function(event) {
            console.log('receive');
            if (G.gameManager.selectCard1 == null) {
                G.gameManager.selectCard1 = event.getUserData();
            } else {
                console.log('exchange');
                G.gameManager.selectCard2 = event.getUserData();
                var card1 = G.gameManager.selectCard1;
                var card2 = G.gameManager.selectCard2;
                var tempSprite = card1.getComponent(cc.Sprite).spriteFrame;
                card1.getComponent(cc.Sprite).spriteFrame = card2.getComponent(cc.Sprite).spriteFrame;
                card2.getComponent(cc.Sprite).spriteFrame = tempSprite;
                var tempCard = card1.card;
                card1.card = card2.card;
                card2.card = tempCard;
                card1.stopAnim();
                card2.stopAnim();
                G.gameManager.selectCard1 = null;
                G.gameManager.selectCard2 = null;
            }
        });
        this.node.on('cardUnSelect', function(event) {
            G.gameManager.selectCard1 = null;
        });

        this.selectPile1 = null;
        this.selectPile2 = null;
        this.node.on('pileSelect', function(event) {
            if ((G.gameManager.gameState == GAME_STATE.PLAYING) && (G.gameManager.turn == STAND.BLACK)) {
                if (G.gameManager.selectPile1 == null) {
                    if (event.getUserData().parent === 'MyCards') {
                        G.gameManager.selectPile1 = event.getUserData();
                        G.gameManager.btnDiscard.active = true;
                        console.log(event.getUserData().getCardName());
                    }
                } else {
                    var pile1 = G.gameManager.selectPile1;
                    var pile2 = event.getUserData();
                    if (pile1 === pile2) {
                        pile1.getCard().getComponent('Card').stopAnim();
                        G.gameManager.btnDiscard.active = false;
                        G.gameManager.selectPile1 = null;
                    } else if (pile2.parent === 'MyCards') {
                        pile1.getCard().getComponent('Card').stopAnim();
                        G.gameManager.selectPile1 = pile2;
                    } else {
                        G.gameManager.btnDiscard.active = false;
                        G.gameManager.gameState = GAME_STATE.WAIT;
                        G.gameManager.btnDiscard.active = false;
                        G.gameManager.turn = STAND.WHITE;
                        console.log('Attack!');
                        G.gameManager.selectPile2 = pile2;
                        G.roomSocket.emit('attack', [pile1.pile, pile1.getCardName(), pile2.pile]);
                    }
                }
            }
        });

        // 攻击响应
        G.roomSocket.on('attack result', function(card) {
            var card1 = G.gameManager.selectPile1.getCardName();
            var card2 = card;
            console.log('己方卡牌：' + card1);
            console.log('对方卡牌：' + card2);

            G.gameManager.selectPile1.getCard().getComponent('Card').stopAnim();
            G.gameManager.selectPile1.getCard().getComponent('Card').pkAnim('MyCards', card, 'discard');
            G.gameManager.selectPile2.getCard().getComponent('Card').pkAnim('HisCards', card, 'back');
            G.gameManager.selectPile1 = null;
        })

        // 被攻击
        G.roomSocket.on('be attacked', function(args) {
            // G.gameManager.showInfo('对方用第' + args[0] + 'Pile的' + args[1] + '\n攻击了你的第' + args[2] + 'Pile的' + pile.getComponent('pile').getCard());

            G.gameManager.turn = STAND.BLACK;
            var pile1 = cc.find('MyCards/pile' + args[2], G.gameManager.node);
            var pile2 = cc.find('HisCards/pile' + args[0], G.gameManager.node);

            var card1 = pile1.getComponent('pile').getCardName();
            var card2 = args[1];
            console.log('己方卡牌：' + card1);
            console.log('对方卡牌：' + card2);

            pile1.getComponent('pile').getCard().getComponent('Card').pkAnim('MyCards', args[1], 'back');
            pile2.getComponent('pile').getCard().getComponent('Card').pkAnim('HisCards', args[1], 'discard');

            G.roomSocket.emit('response', pile1.getComponent('pile').getCardName());
        });

        G.roomSocket.on('discard', function(pile) {
            G.gameManager.turn = STAND.BLACK;
            cc.find('HisCards/pile' + pile, G.gameManager.node).getComponent('pile').getCard().getComponent('Card').discardAnim();
        });

        G.roomSocket.on('game start', function() {
            console.log('game start');
            if (G.gameManager.turn === STAND.BLACK) {
                G.gameManager.gameState = GAME_STATE.PLAYING;
            } else if (G.gameManager.turn === STAND.WHITE) {
                G.gameManager.gameState = GAME_STATE.WAIT;
            }
            G.gameManager.showInfo('游戏开始');
        });
        G.roomSocket.on('someone disconnect', function() {
            G.roomSocket.disconnect();
            cc.director.loadScene('Match');
        });
    },

    changeTurn() {
        console.log('change turn');
        if (this.turn === STAND.BLACK) {
            this.turn = STAND.WHITE;
        } else {
            this.turn = STAND.BLACK;
        }
        console.log(this.btnDiscard.active);

    },

    showInfo(text) {
        this.label.string = text;
        this.anim.play();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});