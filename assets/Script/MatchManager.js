var Constants = require('Constants');
const URL = Constants.URL;
const STAND = Constants.STAND;
cc.Class({
    extends: cc.Component,

    // use this for initialization
    onLoad: function() {
        G.queueSocket = io.connect(URL + '/queue', { 'force new connection': true });

        G.queueSocket.on('set stand', function(stand) {
            if (stand === 'black') {
                G.stand = STAND.BLACK;
            } else {
                G.stand = STAND.WRITE;
            }
        })

        G.queueSocket.on('match success', function(roomId) {
            console.log('match success' + roomId);
            G.roomSocket = io.connect(URL + '/rooms' + roomId, { 'force new connection': true });
            G.queueSocket.disconnect();
            cc.director.loadScene('Game');
        });
    },

    onBtnCancle: function() {
        G.queueSocket.disconnect();
        cc.director.loadScene('Menu');
    },
});