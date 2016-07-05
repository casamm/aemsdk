var AEM = require("../aem");

var Article = (function(){

    /**
     * Article class constructor
     * @constructor
     */
    function Article() {}

    Article.prototype = Object.create(AEM.Entity.prototype);
    Article.prototype.constructor = Article;
    
    return Article;

}());

AEM.Article = Article;