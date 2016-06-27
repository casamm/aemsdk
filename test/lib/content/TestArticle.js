describe('Article', function() {

    var assert = require('assert');
    var AEM = require("../../lib/aem");
    var credentials = require('../lib/credentials.json');
    var aem;
    var article;

    before(function() {
        aem = new AEM(credentials);
        article = new AEM.Article("b5bacc1e-7b55-4263-97a5-ca7015e367e0", "test1-a");
    });

    describe('#Article()', function () {
        it('should be instantiated', function () {
            assert.ok(article, "constructor test");
        });
    });

    after(function(){
        aem = null;
        article = null;
    });

});