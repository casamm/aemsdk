var assert = require('assert');
var AEM = require("../../../lib/aem");
var bundle = new AEM.Bundle();
var authorization = new AEM.Authorization();

var publicationId = 'b5bacc1e-7b55-4263-97a5-ca7015e367e0';
var bundleId = "subscription1";

describe("#Bundle()", function(){

    it("should construct", function(done){
        assert.ok(bundle);
        done();
    });

    // it('should create', function(done){
    //     var body = {
    //         schema: {
    //             id: bundleId,
    //             bundleType: "SUBSCRIPTION",
    //             label: "subscription label",
    //             strategy: '*',
    //             subscriptionType: 'STANDARD'
    //         },
    //         entityType: AEM.Bundle.TYPE,
    //         publicationId: publicationId
    //     };
    //     bundle.create(body)
    //         .then(function(data){
    //             done();
    //         })
    //         .catch(console.error);
    // });

    it('should verify and requestMetadata', function(done){
        this.timeout(5000);
        var body = {
            schema: {
                publicationId: publicationId
            },
            permissions: ['product_add', 'product_view'] //permissions to check for
        };

        authorization.verify(body)
            .then(function(result){
                var meta = {
                    schema: {
                        id: bundleId
                    },
                    entityType: AEM.Bundle.TYPE,
                    publicationId: publicationId
                };
                return bundle.requestMetadata(meta);
            })
            .then(function(result){
                assert.ok(result.schema.id == bundleId);
                done();
            })
            .catch(console.error);
    });

    it('should requestList', function(done){
        var body = {
            schema: {
                id: bundleId
            },
            entityType: AEM.Bundle.TYPE,
            publicationId: publicationId
        };
        bundle.requestList(body)
            .then(function(data){
                assert.ok(data);
                assert.ok(data.entities);
                done();
            })
            .catch(console.error);
    });

    it('should requestList', function(done){
        var body = {
            schema: {
                id: bundleId
            },
            entityType: AEM.Bundle.TYPE,
            publicationId: publicationId
        };
        bundle.requestList(body)
            .then(function(data){
                assert.ok(data);
                assert.ok(data.entities);
                done();
            })
            .catch(console.error);
    });

    it('should requestMetadata for a product', function(done){
        var body = {
            schema: {
                id: bundleId
            },
            entityType: AEM.Bundle.TYPE,
            publicationId: publicationId
        };
        bundle.requestMetadata(body)
            .then(function(result){
                assert.ok(result.schema.id == bundleId);
                done();
            })
            .catch(console.error)
    });

    it('should requestMetadata for all products in parallel', function(done){
        this.timeout(0);
        var body = {
            schema: {},
            entityType: AEM.Bundle.TYPE,
            publicationId: publicationId
        };
        var total;
        bundle.requestList(body)
            .then(function(data){
                Promise.all(data.entities.map(function(value){
                    var obj = {
                        schema: {
                            id: value.id
                        },
                        entityType: AEM.Bundle.TYPE,
                        publicationId: publicationId
                    };
                    return bundle.requestMetadata(obj);
                })).then(function(result){
                    assert.ok(result.length == data.entities.length);
                    done();
                });
            })
    });
});


