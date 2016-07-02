describe('Article', function() {

    var assert = require('assert');
    var AEM = require("../../../lib/aem");
    AEM.config.credentials = require('../../lib/credentials.json');
    var article = new AEM.Article();

    describe('#Article()', function () {
        it('should be instantiated', function () {
            assert.ok(article, "constructor test");
        });
    });

});