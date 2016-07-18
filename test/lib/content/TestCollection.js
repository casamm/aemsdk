var assert = require('assert');
var AEMM = require("../../../lib/aemm");

var collection = new AEMM.Collection();
var authorization = AEMM.authorization;
var fs = require('fs');
var path = require("path");

var publicationId = "b5bacc1e-7b55-4263-97a5-ca7015e367e0";
var entity = {
    entityName: "demo",
    entityType: AEMM.Collection.TYPE,
    publicationId: publicationId,
    title: "collection from nodejs",
    shortTitle: "nodejs",
    productIds: ["product_collection_demo"]
};

var thumbnail = {path: path.join(__dirname, '../resources/image/thumbnail.png'), subpath: "images/thumbnail", sizes: '2048, 1020, 1536, 1080, 768, 640, 540, 320'};
var background = {path: path.join(__dirname, '../resources/image/background.png'), subpath: "images/background", sizes: '2048, 1020, 1536, 1080, 768, 640, 540, 320'};
var socialSharing = {path: path.join(__dirname, '../resources/image/socialSharing.png'), subpath: "images/socialSharing", sizes: '2048, 1020, 1536, 1080, 768, 640, 540, 320'};

var contentElements = [
    {href: "/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/article/test1-a;version=1465569834257"},
    {href: '/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/article/test2-b;version=1465569833754'}
];

describe('#Collection()', function () {

    it('should be instantiated', function () {
        assert.ok(collection, 'constructor test');
    });
});

describe("#topLevelPhoneContent unpublish", function(){
    var data = {
        schema: {
            entityType: AEMM.Collection.TYPE,
            publicationId: publicationId
        }
    };

    it("should not unpublish", function(done){
        data.entityName = "topLevelPhoneContent";
        collection.requestMetadata(data)
            .then(collection.unpublish)
            .then(function(){
                assert.ok(false, "should not be able to unpublish");
            })
            .catch(function(error){
                delete data.entityName; // reset
                done();
            });
    });

    it("publish all", function(done){
        this.timeout(0);
        collection.requestList(data)
            .then(collection.publish)
            .then(collection.addWorkflowObserver)
            .then(function(){
                done();
            })
            .catch(console.error);
    });

    it("unpublish all", function(done){
        this.timeout(0);
        collection.requestList(data)
            .then(collection.unpublish)
            .then(collection.addWorkflowObserver)
            .then(function(){
                done();
            })
            .catch(console.error);
    })
});

describe('#create()', function () {
    this.timeout(5000);
    var body = {
        schema: entity,
        permissions: [AEMM.Authorization.PRODUCER_CONTENT_ADD, AEMM.Authorization.PRODUCER_CONTENT_DELETE] //permissions to check for
    };
    it('should create', function(done){
        collection.create(body)
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });
    it('should create after authorization', function (done) {
        authorization.verify(body)
            .then(collection.create)
            .then(collection.delete)
            .then(function(data){
                done();
            })
            .catch(console.error);
    });
});

describe("#requestList()", function(){
    it("should list", function(done){
        var body2 = {
            query: "page=0&pageSize=5&q=entityType==collection&sortField=modified&descending=true",
            schema: {
                publicationId: entity.publicationId
            }
        };
        collection.requestList(body2)
            .then(function(data){
                assert.ok(data.entities);
                done();
            })
            .catch(console.error);
    });

    it('should request for all collection elements', function(done){
        this.timeout(15000);
        var body = {
            query: "pageSize=5&q=entityType==collection",
            schema: {
                publicationId: entity.publicationId
            }
        };

        collection.requestList(body)
            .then(function(data){
                return new Promise(function(resolve, reject){
                    var promises = [];
                    for(var i=0; i<data.entities.length; i++) {
                        var matches = data.entities[i].href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                        var body2 = JSON.parse(JSON.stringify(body));
                        body2.schema = {
                            entityName: matches[2],
                            entityType: matches[1],
                            publicationId: publicationId
                        };
                        promises.push(collection.requestMetadata(body2))
                    }
                    Promise.all(promises).then(resolve, reject);
                });
            })
            .then(function(data){
                assert.ok(data);
                data.forEach(function(value){
                    assert.ok(value);
                });
            })
            .then(function(){done()})
            .catch(console.error);
    });

    it('should requestList with shortcut metadata', function(done){
        this.timeout(0);
        var body = {
            query: "pageSize=100&q=entityType==collection",
            schema: {
                publicationId: entity.publicationId
            }
        };
        collection.requestList(body)
            .then(function(result){
                return Promise.all(result.entities.map(function(entity){
                    return collection.requestMetadata(entity);
                }))
            })
            .then(function(result){
                done();
            })
            .catch(console.error);
    })
});

describe('#requestMetadata()', function () {
    var body = {
        schema: entity
    };

    it("should requestMetadata", function(done){
        collection.create(body)
            .then(collection.requestMetadata)
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });
});

describe('#uploadImage()', function () {

    it('should upload thumbnail', function (done) {
        this.timeout(0);
        var body = {
            schema: entity,
            images: [thumbnail]
        };

        collection.create(body)
            .then(collection.uploadImages)
            .then(collection.update)
            .then(collection.seal)
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error)
    });

    it('should upload background', function (done) {
        this.timeout(0);
        var body = {
            schema: entity,
            images: [background]
        };
        collection.create(body)
            .then(collection.uploadImages)
            .then(collection.update)
            .then(collection.seal)
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });

    it('should upload thumbnail, background and socialSharing', function (done) {
        this.timeout(0);
        var datum = {
            schema: entity,
            images: [thumbnail, background, socialSharing]
        };
        collection.create(datum)
            .then(collection.uploadImages)
            .then(collection.update)
            .then(collection.seal)
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });

    it("should download images", function(done){
        this.timeout(0);
        var datum = {
            schema: entity,
            images: [thumbnail, background, socialSharing], // required for initial setup
            downSamples: true
        };
        collection.create(datum)
            .then(collection.uploadImages)
            .then(collection.update)
            .then(collection.seal)
            .then(collection.downloadImages)
            .then(function(datum){
                assert.ok(datum.images.length);
                var isDownloaded = false;
                datum.images.forEach(function(image){
                    isDownloaded = true;
                    assert.ok(fs.existsSync(image));
                    fs.unlink(image);
                });
                assert.ok(isDownloaded);
                return datum;
            })
            .then(collection.delete)
            .then(function(){
                done();
            })
            .catch(console.error)
    });
});

describe('#update()', function () {
    var datum = {
        schema: entity,
        update: {
            title: "newtitle",
            shortTitle: "new short title"
        }
    };
    it('should update', function (done) {
        collection.create(datum)
            .then(collection.update)
            .then(function(datum) {
                assert.ok(datum.schema.title == "newtitle");
                assert.ok(datum.schema.shortTitle == "new short title");
                return datum;
            })
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });
});

describe("#requestContentElements()", function(){
    var body = {
        schema: entity,
        contentElements: null
    };
    it("should getContentElements", function(done){
        collection.create(body)
            .then(collection.requestMetadata)
            .then(collection.requestContentElements)
            .then(function(data){
                assert.ok(data.contentElements.length == 0);
                return data;
            })
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });
});

describe("#updateContentElements()", function(){
    var datum = {
        schema: entity,
        contentElements: contentElements
    };
    it("should updateContentElements", function(done){
        collection.create(datum)
            .then(collection.updateContentElements)
            .then(collection.requestContentElements)
            .then(function(datum){
                assert.ok(datum.contentElements.length == 2);
                return datum;
            })
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });

    it("should updateContentElements and requestReferencing", function(done){
        this.timeout(0);
        var datum = {
            schema: entity,
            contentElements: contentElements
        };

        var datum2 = {
            schema: {
                entityType: AEMM.Article.TYPE,
                entityName: "test1-a",
                publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0"
            },
            referencingEntityType: AEMM.Collection.TYPE
        };

        var article = new AEMM.Article();
        article.requestMetadata(datum2)
            .then(function(articleMetadata){
                collection.create(datum)
                    .then(collection.updateContentElements)
                    .then(function(collectionMetadata){
                        return article.requestReferencing(articleMetadata)
                            .then(function(datum){
                                assert.ok(datum.referencingEntities.length);
                                return collectionMetadata;
                            })
                    })
                    .then(collection.delete)
                    .then(function(){
                        done();
                    })
                    .catch(console.error);

            })
    })
});

describe("#publish() collection", function(){
    this.timeout(0);
    it("should publish and then unpublish the collection", function(done){
        var body = {
            schema: entity,
            images: [thumbnail],
            notify: function(status){
                console.log(status);
            }
        };
        collection.create(body)
            .then(collection.uploadImages)
            .then(collection.update)
            .then(collection.seal)
            .then(collection.publish)
            .then(collection.addWorkflowObserver)
            .then(collection.unpublish)
            .then(collection.addWorkflowObserver)
            .then(collection.delete)
            .then(function(data){done()})
            .catch(console.error)
    });
});

describe("#addEntity()", function(){

    it("should addEntity", function(done){
        var body = {
            schema: entity,
            contentElement: contentElements[0],
            isLatestFirst: false
        };
        collection.create(body)
            .then(collection.addEntity)
            .then(collection.updateContentElements)
            .then(collection.requestContentElements)
            .then(function(data){
                assert.ok(data.contentElements.length == 1);
                return data;
            })
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error)
    });

    it("should add two entities one at a time", function(done){
        this.timeout(0);
        var body = {
            schema: entity,
            contentElement: contentElements[0]
        };

        collection.create(body)
            .then(collection.requestContentElements)
            .then(collection.addEntity)
            .then(function(data){
                assert.ok(data.contentElements.length == 1);
                return data;
            })
            .then(collection.updateContentElements)
            .then(collection.requestContentElements)
            .then(function(data){
                assert.ok(data.contentElements.length == 1);
                assert.ok(data.contentElements[0].href = contentElements[0].href);
                return data;
            })
            .then(function(data){
                data.contentElement = contentElements[1];
                data.isLatestFirst = true;
                return data;
            })
            .then(collection.addEntity)
            .then(function(data){
                assert.ok(data.contentElements.length == 2);
                return data;
            })
            .then(collection.updateContentElements)
            .then(collection.requestContentElements)
            .then(function(data){
                assert.ok(data.contentElements.length == 2);
                assert.ok(data.contentElements[0].href = contentElements[1].href);
                return data;
            })
            .then(collection.delete)
            .then(function(){done()})
            .catch(function(error){
                console.log(error);
            })
    });

    it("should not add same collection twice", function(done){
        var body = {
            schema: entity,
            contentElement: contentElements[0],
            isLatestFirst: false
        };
        collection.create(body)
            .then(collection.addEntity)
            .then(collection.addEntity)
            .then(function(data){
                assert.ok(data.contentElements.length == 1);
                return data;
            })
            .then(collection.delete)
            .then(function(){done()})
    });
});

describe("#removeEntity", function(){

    it("should removeEntity one at a time", function(done){
        this.timeout(5000);
        var body = {
            schema: entity,
            contentElements: contentElements
        };

        collection.create(body)
            .then(collection.updateContentElements)
            .then(collection.requestContentElements)
            .then(function(data){
                assert.ok(data.contentElements.length == 2);
                return data;
            })
            .then(function(data){
                data.contentElement = contentElements[1];
                return data;
            })
            .then(collection.removeEntity)
            .then(collection.updateContentElements)
            .then(collection.requestContentElements)
            .then(function(data){
                assert.ok(data.contentElements.length == 1);
                assert.ok(data.contentElements[0].href == contentElements[0].href.split(";version")[0]);
                return data;
            })
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });

    it("should work without contentElement specified", function(done){
        var body = {
            schema: entity
        };

        collection.create(body)
            .then(collection.requestContentElements)
            .then(collection.removeEntity)
            .then(collection.updateContentElements)
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });

    it("should not remove an invalid article", function(done){
        this.timeout(10000);
        var body = {
            schema: entity
        };

        collection.create(body)
            .then(collection.requestContentElements)
            .then(function(data){
                assert.ok(data.contentElements.length == 0);
                return data;
            })
            .then(function(data){ //specify an invalid article
                data.contentElement = {href: "/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/article/invalid"};
                return data;
            })
            .then(collection.removeEntity)
            .then(collection.updateContentElements)
            .then(collection.requestContentElements)
            .then(function(data){
                assert.ok(data.contentElements.length == 0);
                return data;
            })
            .then(collection.delete)
            .catch(console.error)
            .then(function(){done()})
    });

    it("should add two and remove one", function(done){
        this.timeout(7000);
        var body = {
            schema: entity,
            contentElements: [
                {href: "/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/article/test1-a"},
                {href: '/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/article/test2-b'}
            ],
            contentElement: contentElements[0] //collection to remove
        };

        collection.create(body)
            .then(collection.updateContentElements)
            .then(collection.removeEntity)
            .then(collection.updateContentElements)
            .then(collection.requestContentElements)
            .then(function(data){
                assert.ok(data.contentElements.length == 1);
                assert.ok(data.contentElements[0].href == contentElements[1].href.split(";version=")[0]);
                return data;
            })
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });
});

describe("#requestWorkflow()", function(){
    it("should return workflow", function(done){
        this.timeout(0);
        var body = {
            schema: entity,
            images: [thumbnail, background, socialSharing]
        };
        collection.create(body)
            .then(collection.uploadImages)
            .then(collection.update)
            .then(collection.seal)
            .then(collection.publish) // requestStatus test itself to test requestWorkflow directly
            .then(function(result){
                return new Promise(function(resolve, reject){
                    var id = setInterval(function(){
                        collection.requestWorkflow(result)
                            .then(function(data){
                                switch(data.workflowStatus.status) {
                                    case "RUNNING": break;
                                    case "COMPLETED": clearInterval(id); resolve(data); break;
                                    case "NOT_FOUND": clearInterval(id); resolve(data); break;
                                }
                            });
                    }, 1000);
                });
            })
            .then(collection.unpublish)
            .then(function(result){
                return new Promise(function(resolve, reject){
                    var id = setInterval(function(){
                        collection.requestWorkflow(result)
                            .then(function(data){
                                switch(data.workflowStatus.status) {
                                    case "RUNNING": break;
                                    case "COMPLETED": clearInterval(id); resolve(data); break;
                                    case "NOT_FOUND": clearInterval(id); resolve(data); break;
                                }
                            });
                    }, 1000);
                });
            })
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });
});
