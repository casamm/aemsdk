var AEM = require("../aem");

/**
 * Publication class constructor
 * @constructor
 */
function Publication() {}

Publication.prototype = Object.create(AEM.Entity.prototype);
Publication.prototype.constructor = Publication;

Publication.TYPE = "publication";

AEM.Publication = Publication;