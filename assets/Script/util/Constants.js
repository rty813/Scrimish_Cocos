const URL = '139.199.37.92:4747';
const URLL = '139.199.37.92:4747';
const STAND = cc.Enum({
    BLACK: 47,
    WHITE: -47
});

const GAME_STATE = cc.Enum({
    PREPARE: -1,
    PLAYING: -2,
    OVER: -3,
    WAIT: -4,
});


module.exports = {
    STAND: STAND,
    GAME_STATE: GAME_STATE,
    URL: URL,
};