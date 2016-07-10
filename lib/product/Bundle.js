var AEM = require('../aem');

function Bundle() {
    AEM.Product.call(this);
}

Bundle.prototype = Object.create(AEM.Product.prototype);
Bundle.prototype.constructor = Bundle;

Bundle.TYPE = 'bundle';

AEM.Bundle = Bundle;