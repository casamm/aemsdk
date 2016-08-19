describe('Entity', function() {

    var assert = require('assert');
    var AEMM = require("../../../lib/aemm");
    var authentication = new AEMM.Authentication();
    var entity = new AEMM.Entity();

    before(function(done){
        authentication.requestToken()
            .then(function(){done()})
            .catch(console.error);
    });

    var data = {
        schema: {entityType: AEMM.Entity.TYPE, publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0"}
    };

    it('should be instantiated', function () {
        assert.ok(entity, "constructor test");
    });

    it('#requestList Layout', function (done) {
        data.schema.entityType = AEMM.Layout.TYPE;

        entity.requestList(data)
            .then(function(data){
                assert.ok(data);
                done();
            })
            .catch(console.log);
    });

});