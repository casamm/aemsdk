var assert = require('assert');
var AEM = require("../../../lib/aem");
AEM.config.credentials = require('../../lib/credentials.json');
var collection = new AEM.Collection();
var authorization = AEM.authorization;

var entity = {
    entityName: "demo",
    entityType: AEM.Collection.TYPE,
    publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0",
    title: "collection from nodejs",
    shortTitle: "nodejs",
    productIds: ["product_collection_demo"]
};

var thumbnail = {path: __dirname + '/img/thumbnail.png', type: "thumbnail", sizes: '2048, 1020, 1536, 1080, 768, 640, 540, 320'};
var background = {path: __dirname + '/img/background.png', type: "background", sizes: '2048, 1020, 1536, 1080, 768, 640, 540, 320'};
var social = {path: __dirname + '/img/social.png', type: "socialSharing", sizes: '2048, 1020, 1536, 1080, 768, 640, 540, 320'};

var contentElements = [
    {href: "/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/article/test1-a"},
    {href: "/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/article/test2-b"}
];

describe('#Collection()', function () {
    it('should be instantiated', function () {
        assert.ok(collection, 'constructor test');
    });
});

describe('#create()', function () {
    this.timeout(5000);
    var body = {
        data: entity,
        permissions: ["producer_content_add", "producer_content_delete"] //permissions to check for
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
            query: "collection?pageSize=5&q=entityType==collection",
            data: {
                entityType: entity.entityType,
                publicationId: entity.publicationId
            }
        };
        collection.requestList(body2)
            .then(function(data){
                assert.ok(data.collections);
                done();
            })
            .catch(console.error);
    });

    it('should request for all collection elements', function(done){
        this.timeout(15000);
        var body = {
            query: "collection?pageSize=5&q=entityType==collection",
            data: {
                entityType: entity.entityType,
                publicationId: entity.publicationId
            }
        };

        collection.requestList(body)
            .then(function(data){
                return new Promise(function(resolve, reject){
                    var promises = [];
                    for(var i=0; i<data.collections.length; i++) {
                        var matches = data.collections[i].href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                        var body2 = JSON.parse(JSON.stringify(body));
                        body2.data = {
                            entityName: matches[2],
                            entityType: matches[1],
                            publicationId: body.data.publicationId
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
                    //console.log(data[i].entity.title);
                });
            })
            .then(function(){done()})
            .catch(console.error);
    });
});

describe('#requestMetadata()', function () {
    var body = {
        data: entity
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
        this.timeout(10000);
        var body = {
            data: entity,
            image: thumbnail
        };

        collection.create(body)
            .then(collection.uploadImage)
            .then(collection.update)
            .then(collection.seal)
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error)
    });

    it('should upload background', function (done) {
        this.timeout(15000);
        var body = {
            data: entity,
            image: background
        };
        collection.create(body)
            .then(collection.uploadImage)
            .then(collection.update)
            .then(collection.seal)
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error)
    });

    it('should upload thumbnail, background and socialSharing', function (done) {
        this.timeout(25000);
        var body = {
            data: entity,
            image: thumbnail
        };
        collection.create(body)
            .then(collection.uploadImage)
            .then(function(data){
                data.image = background;
                return data;
            })
            .then(collection.uploadImage)
            .then(function(data){
                data.image = social;
                return data;
            })
            .then(collection.uploadImage)
            .then(collection.update)
            .then(collection.seal)
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });
});

describe('#update()', function () {
    var body = {
        data: entity
    };

    it('should create', function (done) {
        collection.create(body)
            .then(function(res){
                res.data.title = "title";
                res.data.shortTitle = "nodejs2";
                return res;
            })
            .then(collection.update)
            .then(function(res) {
                assert.ok(res.data.title == "title");
                assert.ok(res.data.shortTitle == "nodejs2");
                return res;
            })
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });
});

describe("#requestContentElements()", function(){
    var body = {
        data: entity,
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
    var body = {
        data: entity,
        contentElements: contentElements
    };
    it("should updateContentElements", function(done){
        collection.create(body)
            .then(collection.updateContentElements)
            .then(collection.requestContentElements)
            .then(function(data){
                assert.ok(data.contentElements.length == 2);
                return data;
            })
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });
});

xdescribe("#publish() collection", function(){
    this.timeout(30000);
    it("should publish and then unpublish the collection", function(done){
        var body = {
            entity: collection,
            image: thumbnail
        };
        collection.create(body)
            .then(collection.uploadImage)
            .then(collection.update)
            .then(collection.seal)
            .then(collection.publish)
            .then(function(data){
                return new Promise(function(resolve, reject){
                    setTimeout(function(){resolve(data)}, 15000);
                });
            })
            .then(collection.unpublish)
            .then(collection.delete)
            .then(function(data){done()})
            .catch(console.error)
    });
});

describe("#addEntity()", function(){

    it("should addEntity", function(done){
        var body = {
            data: entity,
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
        this.timeout(10000);
        var body = {
            data: entity,
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
            data: entity,
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
            data: entity,
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
                assert.ok(data.contentElements[0].href == contentElements[0].href);
                return data;
            })
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });

    it("should work without contentElement specified", function(done){
        var body = {
            data: entity
        };

        collection.create(body)
            .then(collection.requestContentElements)
            .then(collection.removeEntity)
            .then(collection.updateContentElements)
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });

    it("should not remove an invalid collection", function(done){
        this.timeout(10000);
        var body = {
            data: entity
        };

        collection.create(body)
            .then(collection.requestContentElements)
            .then(function(data){
                assert.ok(data.contentElements.length == 0);
                return data;
            })
            .then(function(data){ //specify an invalid collection
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
            data: entity,
            contentElements: JSON.parse(JSON.stringify(contentElements)),
            contentElement: contentElements[0] //collection to remove
        };

        collection.create(body)
            .then(collection.updateContentElements)
            .then(collection.removeEntity)
            .then(collection.updateContentElements)
            .then(collection.requestContentElements)
            .then(function(data){
                assert.ok(data.contentElements.length == 1);
                assert.ok(data.contentElements[0].href == contentElements[1].href);
                return data;
            })
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });
});

xdescribe("#requestStatus()", function(){
    it("should return status", function(done){
        this.timeout(0);
        var body = {
            entity: collection,
            image: thumbnail
        };
        collection.create(body)
            .then(collection.uploadImage)
            .then(collection.update)
            .then(collection.seal)
            .then(collection.publish)
            .then(function(data){
                return new Promise(function(resolve, reject){
                    var intervalId = setInterval(function(){
                        collection.requestStatus(data).then(function(data){
                            console.log("publish", data.status[0].eventType);
                            switch(data.status[0].eventType) {
                                case "success":
                                    clearInterval(intervalId);
                                    console.log("delay");
                                    setTimeout(function(){console.log("delay end");resolve(data)}, 5000);
                                    break;
                                case "failure":
                                    clearInterval(intervalId);
                                    reject(data.status);
                                    break;
                                case "progress":
                                    break;
                            }
                        });
                    }, 2000);
                });
            })
            .then(collection.unpublish)
            .then(function(data) {
                return new Promise(function (resolve, reject) {
                    collection.requestStatus(data).then(function (data) {
                        console.log("unpublish", data.status[0].eventType);
                        switch (data.status[0].eventType) {
                            case "success":
                                console.log('delay 2');
                                setTimeout(function(){console.log("delay 2 end");resolve(data)}, 5000);
                                break;
                            case "failure":
                                clearInterval(intervalId);
                                reject(data.status);
                                break;
                            case "progress":
                                break;
                        }
                    })
                });
            })
            .then(collection.delete)
            .then(function(){done()})
            .catch(console.error);
    });
});
