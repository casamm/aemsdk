describe('Entity', function() {

    var assert = require('assert');
    var AEM = require("../../lib/aem");
    var credentials = require('../lib/credentials.json');
    var aem;

    before(function() {
        aem = new AEM(credentials);
    });

    describe('#AEM.Entity', function () {
        it('should be instantiated', function () {
            var entity = new AEM.Entity("b5bacc1e-7b55-4263-97a5-ca7015e367e0", AEM.Entity.TYPE);
            assert.ok(entity, "constructor test");
        });
    });

    describe('#requestList Article', function () {
        it('should return articles', function (done) {
            var entity = new AEM.Entity("b5bacc1e-7b55-4263-97a5-ca7015e367e0", AEM.Article.TYPE);
            entity.requestList().then(function(data){
                assert.ok(data);
                done();
            }, function(error){
                console.log(error);
            });
        });
    });

    it('#requestList Collection', function (done) {
        var entity = new AEM.Entity("b5bacc1e-7b55-4263-97a5-ca7015e367e0", AEM.Collection.TYPE);
        entity.requestList().then(function(data){
            assert.ok(data);
            done();
        }, function(error){
            console.log(error);
        });
    });

    it('#requestList Layout', function (done) {
        var entity = new AEM.Entity("b5bacc1e-7b55-4263-97a5-ca7015e367e0", AEM.Layout.TYPE, "967d7942-3380-cb55-3e61-ee52e0dfeb29");
        entity.requestList().then(function(data){
            assert.ok(data);
            done();
        }, function(error){
            console.log(error);
        });
    });

    after(function(){
        aem = null;
    });

});