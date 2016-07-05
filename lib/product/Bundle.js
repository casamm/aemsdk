var AEM = require('../aem');

var Bundle = (function(){

    function Bundle() {
        AEM.Product.call(this);
    }

    Bundle.prototype = Object.create(AEM.Product.prototype);
    Bundle.prototype.constructor = Bundle;

    Bundle.TYPE = 'bundle';

    return Bundle;

}());

AEM.Bundle = Bundle;