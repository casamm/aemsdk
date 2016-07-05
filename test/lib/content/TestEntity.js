describe('Entity', function() {

    var assert = require('assert');
    var AEM = require("../../../lib/aem");
    AEM.config.credentials = require('../credentials.json');
    var entity = new AEM.Entity();

    var body = {
        data: {
            entityType: AEM.Article.TYPE,
            publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0"
        }
    };

    it('should be instantiated', function () {
        assert.ok(entity, "constructor test");
    });

    it('should return articles', function (done) {
        entity.requestList(body)
            .then(function(data){
                assert.ok(data);
                done();
            })
            .catch(console.log);
    });

    it('#requestList Layout', function (done) {
        body.data.entityType = AEM.Layout.TYPE;

        entity.requestList(body)
            .then(function(data){
                assert.ok(data);
                done();
            })
            .catch(console.log);
    });

});