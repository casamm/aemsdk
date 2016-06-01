/**
 * Article Constructor
 * @constructor
 */
var Article = function() {};

Article.prototype = require("./Article");
Article.prototype.constructor = Article;

module.exports = new Article();