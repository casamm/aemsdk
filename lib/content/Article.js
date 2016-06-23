var AEM = require("../aem");

var Article = (function(){

    var _entityName = null;

    /**
     * Article class constructor
     * @param publication
     * @param entityName
     * @constructor
     */
    function Article(publicationID, entityName) {
        if(publicationID && entityName) {
            AEM.Entity.call(this, publicationID, Article.TYPE);
            _entityName = entityName;
        } else {
            throw Error('publication and/or name undefined');
        }
    }

    Article.prototype = Object.create(AEM.Entity.prototype);
    Article.prototype.constructor = Article;

    Article.prototype.requestDetail = function() {
        return AEM.Entity.prototype.requestDetail.call(this, _entityName);
    };

    Article.TYPE = "article";

    return Article;

})();

AEM.Article = Article;