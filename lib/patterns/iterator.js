var AEMM = require('../aemm');

function Iterator(asyncfunc) {
    this.asyncfunc = asyncfunc;
}

Iterator.prototype.next = function() {
    return this.asyncfunc();
};

Iterator.prototype.asyncfunc;

AEMM.Iterator = Iterator;