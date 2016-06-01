describe('Entity', function() {

    var entity;
    var assert;

    before(function() {
        entity = new require("../../contentService/Entity");
        assert = require('assert');
    });

    describe('#Entity()', function () {
        it('should be instantiated', function () {
            assert.ok(entity, "constructor test");
        });
    });

    after(function(){
        entity = null;
        assert = null;
    });

});