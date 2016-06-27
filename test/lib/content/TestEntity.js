describe('Entity', function() {

    var assert = require('assert');
    var AEM = require("../../../lib/aem");
    AEM.config.credentials = require('../credentials.json');
    var entity = new AEM.Entity();

    var input = {
        sessionId: AEM.genUUID(),
        metadata: {
            entityType: AEM.Article.TYPE,
            publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0"
        }
    };

    describe('#AEM.Entity', function () {
        it('should be instantiated', function () {
            assert.ok(entity, "constructor test");
        });
    });

    describe('#requestList Article', function () {
        it('should return articles', function (done) {
            entity.requestList(input)
                .then(function(data){
                    assert.ok(data);
                    done();
                })
                .catch(console.log);
        });
    });

    it('#requestList Collection', function (done) {

        input.metadata.entityType = AEM.Collection.TYPE;

        entity.requestList(input)
            .then(function(data){
                assert.ok(data);
                done();
            })
            .catch(console.log);
    });

    it('#requestList Layout', function (done) {
        input.metadata.entityType = AEM.Layout.TYPE;

        entity.requestList(input)
            .then(function(data){
                assert.ok(data);
                done();
            })
            .catch(console.log);
    });

});