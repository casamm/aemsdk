describe('Collection', function() {

    var collection;
    var assert;

    before(function() {
        collection = require("../../contentService/Collection");
        assert = require('assert');
    });

    describe('#Collection()', function () {
        it('should be instantiated', function () {
            assert.ok(collection, "constructor test");
        });
    });

    after(function(){
        collection = null;
        assert = null;
    });

});