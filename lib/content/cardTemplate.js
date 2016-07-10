var AEM = require("../aem");

/**
 * Card class constructor
 * @constructor
 */
function Card() {}

Card.prototype = Object.create(AEM.Entity.prototype);
Card.prototype.constructor = Card;

Card.TYPE = "cardTemplate";

AEM.Card = Card;