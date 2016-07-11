var assert = require('assert');
var AEM = require('../../../lib/aem');
var authorization = new AEM.Authorization();
var product = new AEM.Product();

var publicationId = 'b5bacc1e-7b55-4263-97a5-ca7015e367e0';
var productId = 'com.sothebys.del13';

describe('#Product()', function() {

    it('should construct', function(){
        assert.ok(product);
    });

    it('should check for permissions', function(done){
        var body = {
            schema: {
                entityType: AEM.Product.TYPE,
                publicationId: publicationId
            },
            permissions: ['product_add', 'product_view']
        };
        authorization.verify(body)
            .then(function(data){
                assert.ok(data.permissions.length == 0);
            })
            .then(function(){
                var meta = {
                    schema: {
                        id: productId
                    },
                    entityType: AEM.Product.TYPE,
                    publicationId: publicationId
                };
                return product.requestMetadata(meta);
            })
            .then(function(result){
                assert.ok(result.schema.id == productId);
                done();
            })
            .catch(console.error);
    });

    it('should update', function(done){
        var body = {
            schema: {
                id: productId
            },
            entityType: AEM.Product.TYPE,
            publicationId: publicationId,
        };
        var random = Math.random();
        product.requestMetadata(body)
            .then(function(result){
                assert.ok(result);
                result.schema.label = "label " + random;
                return result;
            })
            .then(product.update)
            .then(function(result){
                assert.ok(result.schema.label == "label " + random);
                done();
            })
            .catch(console.error);
    });

    it('should requestList', function(done){
        var body = {
            entityType: AEM.Product.TYPE,
            publicationId: publicationId
        };
        product.requestList(body)
            .then(function(data){
                assert.ok(data);
                assert.ok(data.products);
                done();
            })
            .catch(console.error);
    });

    it('should requestMetadata for a product', function(done){
        var body = {
            schema: {
                id: productId
            },
            entityType: AEM.Product.TYPE,
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
        var body = {
            entityType: AEM.Product.TYPE,
            publicationId: publicationId
        };
        var total;
        product.requestList(body)
            .then(function(data){
                total = data.products.length;
                var promises = [];
                data.products.forEach(function(value){
                    var obj = {
                        schema: {
                            id: value.id
                        },
                        entityType: AEM.Product.TYPE,
                        publicationId: publicationId
                    };
                    promises.push(product.requestMetadata(obj))
                });
                Promise.all(promises).then(function(data){
                    assert.ok(data.length == total);
                    done();
                });
            })
    });

    it("should get list from both", function(done){
        var bundle = new AEM.Bundle();
        var body = {
            schema: {
                id: productId
            },
            entityType: AEM.Product.TYPE,
            publicationId: publicationId
        };
        var body2 = {
            schema: {
                id: "subscription1"
            },
            publicationId: publicationId,
            entityType: AEM.Bundle.TYPE
        };
        product.requestList(body)
            .then(function(result){
                if(body.products && body2.bundles) done();
            });
        bundle.requestList(body2)
            .then(function(result){
                if(body.products && body2.bundles) done();
            });
    });

    it("should generate issue list", function(done){
        this.timeout(25000);

        var collection = new AEM.Collection();
        var product = new AEM.Product();
        var body = {
            schema: {
                entityType: AEM.Collection.TYPE,
                publicationId: publicationId
            }
        };

        collection.requestList(body) // requestList
            .then(function(data){ // requestMetadata
                var promises = [];
                data.collections.forEach(function(item){
                    var matches = item.href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                    var meta = {schema: {entityName: matches[2], entityType: matches[1], publicationId: publicationId}};
                    promises.push(collection.requestMetadata(meta));
                });
                return Promise.all(promises).then(function(result){
                    data.collections = {};
                    result.forEach(function(item){
                        data.collections[item.schema.entityName] = item.schema;
                    });
                    return data;
                });
            })
            .then(function(list){ // requestStatus
                var promises = [];
                for (var property in list.collections) {
                    var body = {schema: list.collections[property]};
                    promises.push(collection.requestStatus(body));
                }
                return Promise.all(promises).then(function(result){
                    result.forEach(function(item){
                        list.collections[item.schema.entityName].isPublished = item.status.length == 2 && item.status[1].eventType == 'success' ? true : false;
                    });
                    return list;
                });
            })
            .then(function(list){ // productList
                var body = {
                    entityType: AEM.Product.TYPE,
                    publicationId: publicationId
                };
                return product.requestList(body).then(function(data){
                    for(property in list.collections) {
                        list.collections[property].productIds.forEach(function(productId){
                            list.collections[property].products = {};
                            data.products.forEach(function(item){
                                if(productId == item.id) {
                                    delete item.id;
                                    list.collections[property].products[productId] = item;
                                }
                            });
                        });
                    }
                    return list;
                });
            })
            .then(function(list){ // thumbnail
                var promises = [];
                for(property in list.collections) {
                    if(list.collections[property]._links.thumbnail) {
                        var body = {schema: list.collections[property], href: "images/thumbnail"};
                        promises.push(collection.requestEntity(body));
                    }
                }
                return Promise.all(promises).then(function(result){
                    result.forEach(function(item){
                        list.collections[item.schema.entityName].thumbnail = item.thumbnail;
                    });
                    return list;
                });
            })
            .then(function(list){ // background
                var promises = [];
                for(property in list.collections) {
                    if(list.collections[property]._links.background) {
                        var body = {schema: list.collections[property], href: "images/background"};
                        promises.push(collection.requestEntity(body));
                    }
                }
                return Promise.all(promises).then(function(result){
                    result.forEach(function(item){
                        list.collections[item.schema.entityName].background = item.background;
                    });
                    return list;
                });
            })
            .then(function(list){
                var fs = require('fs');

                for(item in list.collections) {
                    if(list.collections[item].thumbnail) assert.ok(fs.existsSync(list.collections[item].thumbnail));
                    if(list.collections[item].background) assert.ok(fs.existsSync(list.collections[item].background));
                }
                done();
            })
            .catch(console.error);
    });
});


// describe('#create()', function(){
//     it('should create', function(done){
//         var body = {
//             schema: {
//                 entityType: AEM.Product.TYPE,
//                 publicationId: publicationId,
//                 id: productId,
//                 label: "Product 1",
//                 isFree: false,
//                 isDistributionRestricted: false
//             }
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
//                 entityType: AEM.Product.TYPE,
//                 publicationId: publicationId,
//                 id: productId
//             },
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