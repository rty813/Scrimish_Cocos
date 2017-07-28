var atk = {
    //card1为攻击牌，card2为被攻击牌
    judge: function(card1, card2) {
        // return ['back', 'discard'];
        if (card2 === 'C') {
            return ['win', 'lose'];
        }
        if (card1 === 'C') {
            return ['lose', 'win'];
        }
        if (card1 === 'A') {
            if (card2 === 'S') {
                return ['back', 'back'];
            } else {
                return ['back', 'discard'];
            }
        }
        if (card2 === 'S') {
            return ['discard', 'discard'];
        }
        if (card2 === 'A') {
            return ['back', 'discard'];
        }
        if (card1 < card2) {
            return ['discard', 'back'];
        }
        if (card1 > card2) {
            return ['back', 'discard'];
        }
        if (card1 === card2) {
            return ['discard', 'discard'];
        }
    }
};

module.exports = atk;