var AEM = require("../aem");

var Article = (function(){

    /**
     * Article class constructor
     * @constructor
     */
    function Article() {
    }

    Article.prototype = Object.create(AEM.Entity.prototype);
    Article.prototype.constructor = Article;

    Article.TYPE = "article";

    return Article;

})();

AEM.Article = Article;