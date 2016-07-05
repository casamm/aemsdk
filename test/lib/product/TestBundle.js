var assert = require('assert');
var AEM = require("../../../lib/aem");
AEM.config.credentials = require('../../lib/credentials.json');
var bundle = new AEM.Bundle();
var authorization = new AEM.Authorization();

var publicationId = 'b5bacc1e-7b55-4263-97a5-ca7015e367e0';
var bundleId = "subscription1";

describe("#Bundle()", function(){
    it("should construct", function(done){
        assert.ok(bundle);
        done();
    });
});

xdescribe('#create()', function(){
    it('should create', function(done){
        var body = {
            data: {
                entityType: AEM.Bundle.TYPE,
                entityName: bundleId,
                publicationId: publicationId
            }
        };
        product.create(body)
            .then(function(data){
                done();
            })
            .catch(console.error);
    });
});

xdescribe('#delete', function(){
    it('should delete', function(done){
        var body = {
            data: {
                entityType: AEM.Bundle.TYPE,
                entityName: bundleId,
                publicationId: publicationId
            },
            permissions: ['product_add', 'product_view'] //permissions to check for
        };

        authorization.verify(body)
            .then(product.delete)
            .then(function(data){
                done();
            })
            .catch(console.error);
    });
});


describe('#requestList', function(){
    it('should requestList', function(done){
        var body = {
            data: {
                entityType: AEM.Bundle.TYPE,
                entityName: bundleId,
                publicationId: publicationId
            },
            permissions: []
        };

        authorization.verify(body)
            .then(bundle.requestList)
            .then(function(data){
                assert.ok(data);
                assert.ok(data.bundles);
                done();
            })
            .catch(console.error);
    });
});

describe('#requestMetadata', function(){
    it('should requestMetadata for a product', function(done){
        var body = {
            data: {
                entityType: AEM.Bundle.TYPE,
                entityName: bundleId,
                publicationId: publicationId
            }
        };
        bundle.requestMetadata(body)
            .then(function(result){
                console.log(result);
                assert.ok(result.data.id == bundleId);
                done();
            })
            .catch(console.error)
    });

    it('should requestMetadata for all products in parallel', function(done){
        var body = {
            data: {
                entityType: AEM.Bundle.TYPE,
                publicationId: publicationId
            }
        };
        var total;
        bundle.requestList(body)
            .then(function(data){
                total = data.bundles.length;
                var promises = [];
                data.bundles.forEach(function(value){
                    var obj = {
                        data: {
                            entityType: AEM.Bundle.TYPE,
                            entityName: value.id,
                            publicationId: publicationId
                        }
                    };
                    promises.push(bundle.requestMetadata(obj))
                });
                Promise.all(promises).then(function(data){
                    assert.ok(data.length == total);
                    done();
                });
            })
    });
});