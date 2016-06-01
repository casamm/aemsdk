describe('Article', function() {

    var article;
    var assert;

    before(function() {
        article = require("../../contentService/Article");
        assert = require('assert');
    });

    describe('#Article()', function () {
        it('should be instantiated', function () {
            assert.ok(article, "constructor test");
        });
    });

    after(function(){
        article = null;
        assert = null;
    });

});