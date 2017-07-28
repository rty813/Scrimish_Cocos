var Constants = require('Constants');
const URL = Constants.URL;
cc.Class({
    extends: cc.Component,

    // use this for initialization
    onLoad: function() {
        // if (cc.sys.isNative) {
        //     window.io = SocketIO.connect;
        // } else {
        //     window.io = require('socket.io');
        // }
        // var socket = window.io(URL);
        G.globalSocket = io.connect(URL);
        G.hallSocket = io.connect(URL + '/hall', { 'force new connection': true });
    },

    onBtnStartGameClicked: function() {
        G.hallSocket.disconnect();
        cc.director.loadScene('Match');
    },

    onBtnExitGameClicked: function() {
        cc.director.end();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});