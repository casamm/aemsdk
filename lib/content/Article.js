var AEM = require("../aem");

/**
 * CardTemplate class constructor
 * @constructor
 */
function Article() {}

Article.prototype = Object.create(AEM.Entity.prototype);
Article.prototype.constructor = Article;

Article.prototype.requestManifest = function(body) {
    return AEM.Entity.prototype.requestEntity.call(this, body);
};

Article.TYPE = "article";

AEM.Article = Article;