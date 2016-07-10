var AEM = require("../aem");

/**
 * CardTemplate class constructor
 * @constructor
 */
function CardTemplate() {}

CardTemplate.prototype = Object.create(AEM.Entity.prototype);
CardTemplate.prototype.constructor = CardTemplate;

CardTemplate.TYPE = "cardTemplate";

AEM.CardTemplate = CardTemplate;