var assert = require('assert');
var AEM = require('../../../lib/aem');
AEM.config.credentials = require('../../lib/credentials.json');
var authorization = new AEM.Authorization();
var product = new AEM.Product();

var publicationId = 'b5bacc1e-7b55-4263-97a5-ca7015e367e0';
var productId = 'com.sothebys.del1';

describe('#Product()', function() {
    it('should construct', function(){
        assert.ok(product);
    })
});

describe('#authorizations', function(){
    var body = {
        data: {
            entityType: AEM.Product.TYPE,
            publicationId: publicationId
        },
        permissions: ['product_add', 'product_view']
    };
    it('should check for permissions', function(done){
        authorization.verify(body)
            .then(function(data){
                done()
            })
            .catch(console.error);
    })
});

xdescribe('#create()', function(){
    it('should create', function(done){
        var body = {
            data: {
                entityType: AEM.Product.TYPE,
                entityName: productId,
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
                entityType: AEM.Product.TYPE,
                entityName: productId,
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
                entityType: AEM.Product.TYPE,
                publicationId: publicationId
            }
        };
        product.requestList(body)
            .then(function(data){
                assert.ok(data);
                assert.ok(data.products);
                done();
            })
            .catch(console.error);
    });
});

describe('#requestMetadata', function(){
    it('should requestMetadata for a product', function(done){
        var body = {
            data: {
                entityType: AEM.Product.TYPE,
                entityName: productId,
                publicationId: publicationId
            }
        };
        product.requestMetadata(body)
            .then(function(result){
                assert.ok(result.data.id == productId);
                done();
            })
            .catch(console.error)
    });

    it('should requestMetadata for all products in parallel', function(done){
        var body = {
            data: {
                entityType: AEM.Product.TYPE,
                publicationId: publicationId
            }
        };
        var total;
        product.requestList(body)
            .then(function(data){
                total = data.products.length;
                var promises = [];
                data.products.forEach(function(value){
                    var obj = {
                        data: {
                            entityType: AEM.Product.TYPE,
                            entityName: value.id,
                            publicationId: publicationId
                        }
                    };
                    promises.push(product.requestMetadata(obj))
                });
                Promise.all(promises).then(function(data){
                    assert.ok(data.length == total);
                    done();
                });
            })
    });
});

describe("product and bundle concurrent test", function(){

    it("should get list from both", function(done){
        var bundle = new AEM.Bundle();
        var body = {
            data: {
                entityType: AEM.Product.TYPE,
                entityName: productId,
                publicationId: publicationId
            }
        };
        var body2 = {
            data: {
                entityType: AEM.Bundle.TYPE,
                entityName: "subscription1",
                publicationId: publicationId
            }
        };
        product.requestList(body)
            .then(function(result){
                if(body.products && body2.bundles) done();
            });
        bundle.requestList(body2)
            .then(function(result){
                if(body.products && body2.bundles) done();
            });
    })
});

describe("genIssueList", function(){
    it("should generate issue list", function(done){
        this.timeout(15000);

        var collection = new AEM.Collection();
        var product = new AEM.Product();
        var body = {
            data: {
                entityType: AEM.Collection.TYPE,
                publicationId: publicationId
            }
        };

        collection.requestList(body) // requestList
            .then(function(data){ // requestMetadata
                var promises = [];
                data.collections.forEach(function(item){
                    var matches = item.href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                    var meta = {data: {entityName: matches[2], entityType: matches[1], publicationId: body.data.publicationId}};
                    promises.push(collection.requestMetadata(meta));
                });
                return Promise.all(promises).then(function(result){
                    data.collections = {};
                    result.forEach(function(item){
                        data.collections[item.data.entityName] = item.data;
                    });
                    return data;
                });
            })
            .then(function(list){ // requestStatus
                var promises = [];
                for (var property in list.collections) {
                    var body = {data: list.collections[property]};
                    promises.push(collection.requestStatus(body));
                }
                return Promise.all(promises).then(function(result){
                    result.forEach(function(item){
                        list.collections[item.data.entityName].isPublished = item.status[1].eventType == 'success';
                    });
                    return list;
                });
            })
            .then(function(list){ // productList
                var body = {
                    data: {
                        entityType: AEM.Product.TYPE,
                        publicationId: publicationId
                    }
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
                        var body = {data: list.collections[property], image: {type: "thumbnail"}};
                        promises.push(collection.requestEntity(body));
                    }
                }
                return Promise.all(promises).then(function(result){
                    result.forEach(function(item){
                        list.collections[item.data.entityName].thumbnail = item.thumbnail;
                    });
                    return list;
                });
            })
            .then(function(list){ // background
                var promises = [];
                for(property in list.collections) {
                    if(list.collections[property]._links.background) {
                        var body = {data: list.collections[property], image: {type: "background"}};
                        promises.push(collection.requestEntity(body));
                    }
                }
                return Promise.all(promises).then(function(result){
                    result.forEach(function(item){
                        list.collections[item.data.entityName].background = item.background;
                    });
                    return list;
                });
            })
            .then(function(list){
                done();
            })
            .catch(console.error);
    });
});