describe('Collection', function() {

    var assert = require('assert');
    var AEM = require("../../lib/aem");
    var credentials = require('../lib/credentials.json');
    var aem;
    var collection;

    before(function() {
        aem = new AEM(credentials);
        collection = new AEM.Collection("b5bacc1e-7b55-4263-97a5-ca7015e367e0", "demo");
    });

    describe('#Collection()', function () {
        it('should be instantiated', function () {
            assert.ok(collection, 'constructor test');
        });
    });

    describe('#requestDetail()', function () {
        it('should return details', function (done) {
            collection.requestDetail().then(function(data){
                assert.ok(data, "details test");
                assert.ok(data.entityName == 'demo');
                done();
            }, function(error){
                console.log(error)
            });
        });
    });

    after(function(){
        aem = null;
        collection = null;
    });

});