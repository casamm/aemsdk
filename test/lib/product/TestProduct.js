var assert = require('assert');
var AEMM = require('../../../lib/aemm');
var product = new AEMM.Product();
var authentication = new AEMM.Authentication();
var authorization = new AEMM.Authorization();
var publicationId = '192a7f47-84c1-445e-a615-ff82d92e2eaa';
var productId = 'ag.casa.demo';

before(function(done) {
    authentication.requestToken()
        .then(function(data) {
            assert.equal(data.access_token, authentication.getToken().access_token);
            done();
        })
        .catch(console.error);
});

describe('#Product()', function() {
    it('should check for permissions', function(done){
        var authorizationData = {schema: {publicationId: publicationId}, permissions: ['product_add', 'product_view']};
        var data = {schema: { id: productId }, entityType: AEMM.Product.TYPE, publicationId: publicationId};
        authorization.verify(authorizationData)
            .then(function(){
                return product.requestMetadata(data);
            })
            .then(function(result){
                assert.ok(result.schema.id == productId);
                done();
            })
            .catch(console.error);
    });

    it('should update', function(done){
        this.timeout(0);
        var data = {
            schema: {id: productId},
            update: {label: "new label"},
            entityType: AEMM.Product.TYPE,
            publicationId: publicationId
        };
        product.requestMetadata(data)
            .then(product.update)
            .then(function(result){
                assert.ok(result.schema.label == "new label");
                done();
            })
            .catch(console.error);
    });

    it('should requestList', function(done){
        var body = {
            schema: {},
            entityType: AEMM.Product.TYPE,
            publicationId: publicationId
        };
        product.requestList(body)
            .then(function(data){
                assert.ok(data);
                assert.ok(data.entities);
                done();
            })
            .catch(console.error);
    });
    it('should requestMetadata for a product', function(done){
        var body = {
            schema: {id: productId},
            entityType: AEMM.Product.TYPE,
            publicationId: publicationId
        };
        product.requestMetadata(body)
            .then(function(result){
                assert.ok(result.schema.id == productId);
                done();
            })
            .catch(console.error)
    });

    it('should requestMetadata for all products in parallel', function(done){
        this.timeout(5000);
        var datum = {
            schema: {},
            entityType: AEMM.Product.TYPE,
            publicationId: publicationId
        };
        var total;
        product.requestList(datum)
            .then(function(result){
                Promise.all(result.entities.map(function(value){
                    var data = {
                        schema: {id: value.id},
                        entityType: AEMM.Product.TYPE,
                        publicationId: publicationId
                    };
                    return product.requestMetadata(data);
                })).then(function(data){
                    assert.ok(data.length == result.entities.length);
                    done();
                });
            })
    });

    it("should get list from both products and bundles", function(done){
        var bundle = new AEMM.Bundle();
        var datum = {
            schema: {id: productId},
            entityType: AEMM.Product.TYPE,
            publicationId: publicationId
        };
        var datum2 = {
            schema: {id: "subscription1"},
            entityType: AEMM.Bundle.TYPE,
            publicationId: publicationId
        };
        product.requestList(datum)
            .then(function(result){
                if(datum.entities && datum2.entities) done();
            });
        bundle.requestList(datum2)
            .then(function(result){
                if(datum.entities && datum2.entities) done();
            });
    });

    it("should generate issue list", function(done){
        this.timeout(0);

        var collection = new AEMM.Collection();
        var product = new AEMM.Product();
        var data = {
            schema: {
                entityType: AEMM.Collection.TYPE,
                publicationId: publicationId
            }
        };

        collection.requestList(data) // requestList
            .then(function(result){ // requestMetadata
                return Promise.all(result.entities.map(function(item){
                    var matches = AEMM.matchUrl(item.href);
                    var meta = {schema: {entityName: matches[2], entityType: matches[1], publicationId: publicationId}};
                    return collection.requestMetadata(meta);
                })).then(function(result){
                    data.entities = {};
                    result.forEach(function(item){
                        data.entities[item.schema.entityName] = item.schema;
                    });
                    return data;
                });
            })
            .then(function(data){ // requestStatus
                var promises = [];
                for (var property in data.entities) {
                    var temp = {schema: data.entities[property]};
                    promises.push(collection.requestStatus(temp));
                }
                return Promise.all(promises).then(function(result){
                    result.forEach(function(item){
                        data.entities[item.schema.entityName].isPublished = item.status.length == 2 && item.status[1].eventType == 'success' ? true : false;
                    });
                    return data;
                });
            })
            .then(function(data){ // productList
                var meta = {
                    schema: {},
                    entityType: AEMM.Product.TYPE,
                    publicationId: publicationId
                };
                return product.requestList(meta)
                    .then(function(product){
                        for(property in data.entities) {
                            data.entities[property].productIds.forEach(function(productId){
                                data.entities[property].products = {};
                                product.entities.forEach(function(item){
                                    if(productId == item.id) {
                                        delete item.id;
                                        data.entities[property].products[productId] = item;
                                    }
                                });
                            });
                        }
                        return data;
                    });
            })
            .then(function(data){ // download thumbnail
                var promises = [];
                for(property in data.entities) {
                    if(data.entities[property]._links.thumbnail) {
                        var body = {schema: data.entities[property], path: "images/thumbnail"};
                        promises.push(collection.requestEntity(body));
                    }
                }
                return Promise.all(promises).then(function(result){
                    result.forEach(function(item){
                        data.entities[item.schema.entityName].thumbnail = item;
                    });
                    return data;
                });
            })
            .then(function(data){ // download background
                var promises = [];
                for(property in data.entities) {
                    if(data.entities[property]._links.background) {
                        var body = {schema: data.entities[property], href: "images/background"};
                        promises.push(collection.requestEntity(body));
                    }
                }
                return Promise.all(promises).then(function(result){
                    result.forEach(function(item){
                        data.entities[item.schema.entityName].background = item.file;
                    });
                    return data;
                });
            })
            .then(function(data){
                var fs = require('fs');
                var hasImages = false;

                for(item in data.entities) {
                    if(data.entities[item].thumbnail) {
                        hasImages = true;
                        assert.ok(fs.existsSync(data.entities[item].thumbnail))
                    }
                    if(data.entities[item].background) {
                        hasImages = true;
                        assert.ok(fs.existsSync(data.entities[item].background));
                    }
                }
                assert.ok(hasImages);
                done();
            })
            .catch(console.error);
    });
});

// describe('#create()', function(){
//     it('should create', function(done){
//         var body = {
//             schema: {
//                 id: productId,
//                 label: "Product 1",
//                 isFree: false,
//                 isDistributionRestricted: false
//             },
//             entityType: AEMM.Product.TYPE,
//             publicationId: publicationId,
//         };
//         product.create(body)
//             .then(function(result){
//                 assert.ok(result);
//                 done()
//             })
//             .catch(console.error);
//     });
// });


// describe('#delete', function(){ //method not allowed
//     it('should delete', function(done){
//         var body = {
//             schema: {
//                 id: productId
//             },
//             entityType: AEMM.Product.TYPE,
//             publicationId: publicationId,
//             permissions: ['product_add', 'product_view'] //permissions to check for
//         };
//         authorization.verify(body)
//             .then(product.delete)
//             .then(function(data){
//                 done();
//             })
//             .catch(console.error);
//     });
// });