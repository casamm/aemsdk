describe('Collection', function() {

    var assert = require('assert');
    var AEM = require("../../../lib/aem");
    AEM.config.credentials = require('../../lib/credentials.json');
    var collection = new AEM.Collection();

    var metadata = {
        entityName: "demo",
        entityType: "collection",
        publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0",
        title: "collection from nodejs",
        shortTitle: "nodejs",
        productIds: ["product_collection_demo"],
        _links: {
            thumbnail:  {
                href: "contents/images/thumbnail"
            },
            background: {
                href: "contents/images/background"
            }
        }
    };

    var contentElements = [
        {
            href: "/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/article/test1-a;version=1465569834257"
        },
        {
            href: "/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/article/test2-b;version=1465569833754"
        }
    ];

    var entity = {
        href: "an invalid link"
    };

    // describe('#Collection()', function () {
    //     it('should be instantiated', function () {
    //         assert.ok(collection, 'constructor test');
    //     });
    // });

    // describe('#create()', function () { //ok
    //     var input = {
    //         sessionId: AEM.genUUID(),
    //         metadata: metadata
    //     };
    //
    //     it('should create', function (input) {
    //         collection.create(data)
    //             .then(collection.delete)
    //             .then(function(){done()})
    //             .catch(console.log);
    //     });
    // });

    // describe('#requestMetadata()', function () {
    //     var input = {
    //         sessionId: AEM.genUUID(),
    //         metadata: metadata
    //     };
    //
    //     it('should create', function(done){
    //         collection.create(input)
    //             .then(collection.requestMetadata)
    //             .then(collection.delete)
    //             .then(function(){done()})
    //             .catch(console.log);
    //     });
    // });

    // describe('#uploadImage() thumbnail', function () {
    //     var input = {
    //         sessionId: AEM.genUUID(),
    //         uploadId: AEM.genUUID(),
    //         imagePath: __dirname + '/img/thumbnail.png',
    //         imageType: "thumbnail",
    //         metadata: metadata
    //     };
    //
    //     it('should create', function (done) {
    //         this.timeout(10000);
    //         collection.create(input)
    //             .then(collection.uploadImage)
    //             .then(collection.seal)
    //             .then(collection.delete)
    //             .then(function(){done()})
    //             .catch(console.log)
    //     });
    // });
    //

    // describe('#uploadImage() background', function () {
    //     var input = {
    //         sessionId: AEM.genUUID(),
    //         uploadId: AEM.genUUID(),
    //         imagePath: __dirname + '/img/background.png',
    //         imageType: "background",
    //         metadata: metadata
    //     };
    //
    //     it('should create', function (done) {
    //         this.timeout(7000);
    //         collection.create(input)
    //             .then(collection.uploadImage)
    //             .then(collection.seal)
    //             //.then(collection.delete)
    //             .then(function(){done()})
    //             .catch(console.log)
    //     });
    // });

    // describe('#uploadImage() thumbnail background', function () {
    //     var input = {
    //         sessionId: AEM.genUUID(),
    //         uploadId: AEM.genUUID(),
    //         metadata: metadata
    //     };
    //
    //     it('should create', function (done) {
    //         this.timeout(10000);
    //         collection.create(input)
    //             .then(function(data){
    //                 data.imageType = "thumbnail";
    //                 data.imagePath = __dirname + '/img/thumbnail.png';
    //                 return collection.uploadImage(data);
    //             })
    //             .then(function(data){
    //                 data.imageType = "background";
    //                 data.imagePath = __dirname + '/img/background.png';
    //                 return collection.uploadImage(data);
    //             })
    //             .then(collection.seal)
    //             .then(collection.delete)
    //             .then(function(){done()})
    //             .catch(console.log);
    //
    //     });
    // });

    // describe('#update()', function () {
    //     var input = {
    //         sessionId: AEM.genUUID(),
    //         metadata: metadata
    //     };
    //
    //     it('should create', function (done) {
    //         collection.create(input)
    //             .then(function(data){
    //                 data.metadata.title = "title";
    //                 data.metadata.shortTitle = "nodejs2";
    //                 return data;
    //             })
    //             .then(collection.update)
    //             .then(function(data) {
    //                 assert.ok(data.metadata.title == "title");
    //                 assert.ok(data.metadata.shortTitle == "nodejs2");
    //                 return data;
    //             })
    //             .then(collection.delete)
    //             .then(function(){done()})
    //             .catch(console.log);
    //     });
    // });

    // describe("#requestList", function(){
    //     var input = {
    //         sessionId: AEM.genUUID(),
    //         query: "?pageSize=5",
    //         metadata: {
    //             entityType: metadata.entityType,
    //             publicationId: metadata.publicationId
    //         }
    //     };
    //
    //     it("should list", function(done){
    //         collection.requestList(input)
    //             .then(function(data){
    //                 assert.ok(data.list.length);
    //                 done();
    //             })
    //             .catch(console.log);
    //     })
    // });

    // describe("#requestContentElements()", function(){
    //     var input = {
    //         sessionId: AEM.genUUID(),
    //         metadata: metadata,
    //         contentElements: null
    //     };
    //     it("should getContentElements", function(done){
    //         collection.create(input)
    //             .then(collection.requestMetadata)
    //             .then(collection.requestContentElements)
    //             .then(function(data){
    //                 assert.ok(data.contentElements.length == 0);
    //                 return data;
    //             })
    //             .then(collection.delete)
    //             .then(function(){done()})
    //             .catch(console.log);
    //     });
    // });
    //
    // describe("#updateContentElements()", function(){
    //     var input = {
    //         sessionId: AEM.genUUID(),
    //         metadata: metadata,
    //         contentElements: contentElements
    //     };
    //     it("should updateContentElements", function(done){
    //         collection.create(input)
    //             .then(collection.updateContentElements)
    //             .then(collection.requestContentElements)
    //             .then(function(data){
    //                 assert.ok(data.contentElements.length == 2);
    //                 return data;
    //             })
    //             .then(collection.delete)
    //             .then(function(){done()})
    //             .catch(console.log);
    //     });
    // });

   //describe("#addEntity()", function(){

        // it("do not use until adobe's answer - should addEntity publish, repeat once", function(done){
        //     this.timeout(5000);
        //     var input = {
        //         sessionId: AEM.genUUID(),
        //         metadata: metadata,
        //         entity: contentElements[0],
        //         isLatestFirst: false
        //     };
        //
        //     collection.create(input)
        //         .then(collection.addEntity.bind(collection))
        //         .then(collection.requestContentElements)
        //         .then(function(data){
        //             assert.ok(data.contentElements.length == 1);
        //             return data;
        //         })
        //         .then(collection.publish)
        //         .then(function(data){
        //             data.entity = contentElements[1];
        //             data.isLatestFirst = true;
        //             return data;
        //         })
        //         .then(collection.addEntity.bind(collection))
        //         .then(collection.requestContentElements)
        //         .then(function(data){
        //             assert.ok(data.contentElements.length == 2);
        //             return data;
        //         })
        //         .then(collection.publish)
        //         .then(function(){done()})
        //         .catch(function(data){
        //             console.log(data.error);
        //         })
        // });

    //     it("should addEntity", function(done){
    //         var input = {
    //             sessionId: AEM.genUUID(),
    //             metadata: metadata,
    //             entity: contentElements[0],
    //             isLatestFirst: false
    //         };
    //         collection.create(input)
    //             .then(collection.addEntity.bind(collection))
    //             .then(collection.requestContentElements)
    //             .then(function(data){
    //                 assert.ok(data.contentElements.length == 1);
    //                 return data;
    //             })
    //             .then(collection.delete)
    //             .then(function(){done()})
    //             .catch(console.log)
    //     });
    //
    //     it("should add two entities one at a time", function(done){
    //         var input = {
    //             sessionId: AEM.genUUID(),
    //             metadata: metadata,
    //             entity: contentElements[0],
    //             isLatestFirst: false
    //         };
    //
    //         collection.create(input)
    //             .then(collection.addEntity.bind(collection))
    //             .then(collection.requestContentElements)
    //             .then(function(data){
    //                 assert.ok(data.contentElements.length == 1);
    //                 assert.ok(data.contentElements[0].href == contentElements[0].href);
    //                 data.entity = contentElements[1];
    //                 data.isLatestFirst = true;
    //                 return data;
    //             })
    //             .then(collection.addEntity.bind(collection))
    //             .then(collection.requestContentElements)
    //             .then(function(data){
    //                 assert.ok(data.contentElements.length == 2);
    //                 assert.ok(data.contentElements[0].href == contentElements[1].href);
    //                 assert.ok(data.contentElements[1].href == contentElements[0].href);
    //                 return data;
    //             })
    //             .then(collection.delete)
    //             .then(function(){done()})
    //             .catch(console.log);
    //     });
    //
    //     it("should reject with adding same entity twice", function(done){
    //         var input = {
    //             sessionId: AEM.genUUID(),
    //             metadata: metadata,
    //             entity: contentElements[0],
    //             isLatestFirst: false
    //         };
    //         collection.create(input)
    //             .then(collection.addEntity.bind(collection))
    //             .then(collection.addEntity.bind(collection))
    //             .then(function(data){ //success handler
    //                 assert.ok(false);
    //             }, function(data){ //error handler
    //                 assert.ok(true);
    //                 return data
    //             })
    //             .then(collection.delete)
    //             .then(function(){done()})
    //     });
    //
    //     it("should reject with an invalid entity", function(done){
    //         var input = {
    //             sessionId: AEM.genUUID(),
    //             metadata: metadata,
    //             entity: entity
    //         };
    //         collection.create(input)
    //             .then(collection.addEntity.bind(collection))
    //             .then(function(){throw Error()})
    //             .catch(collection.delete)
    //             .then(function(){done()});
    //     });
    //
    // });
    //
    // describe("#removeEntity", function(){
    //
    //     it("should removeEntity", function(done){
    //         this.timeout(3000);
    //         var data = {
    //             sessionId: AEM.genUUID(),
    //             metadata: metadata,
    //             entity: contentElements[0]
    //         };
    //
    //         collection.create(data)
    //             .then(collection.addEntity.bind(collection))
    //             .then(collection.requestContentElements)
    //             .then(function(data){
    //                 assert.ok(data.contentElements.length == 1);
    //                 return data;
    //             })
    //             .then(collection.removeEntity.bind(collection))
    //             .then(collection.requestContentElements)
    //             .then(function(data){
    //                 assert.ok(data.contentElements.length == 0);
    //                 return data;
    //             })
    //             .then(collection.delete)
    //             .then(function(){done()})
    //             .catch(console.log);
    //     });
    //
    //     it("should reject without entity specified", function(done){
    //         var input = {
    //             sessionId: AEM.genUUID(),
    //             metadata: metadata
    //         };
    //
    //         collection.create(input)
    //             .then(collection.removeEntity.bind(collection)) //should reject with no entity specified
    //             .then(function(){assert.ok(false)})
    //             .catch(collection.delete)
    //             .then(function(){done()})
    //     });
    //
    //     it("should reject with an invalid entity", function(done){
    //         var input = {
    //             sessionId: AEM.genUUID(),
    //             metadata: metadata,
    //             entity: contentElements[0]
    //         };
    //
    //         collection.create(input)
    //             .then(collection.addEntity.bind(collection))
    //             .then(function(data){
    //                 data.entity = entity;
    //                 return data;
    //             })
    //             .then(collection.removeEntity.bind(collection)) //removing an invalid entity, should reject
    //             .then(function(){assert.ok(false)})
    //             .catch(collection.delete)
    //             .then(function(){done()})
    //     });
    //
    //     it("should add two and remove first", function(done){
    //         this.timeout(5000);
    //         var input = {
    //             sessionId: AEM.genUUID(),
    //             metadata: metadata,
    //             entity: contentElements[0],
    //             isLatestFirst: false
    //         };
    //
    //         collection.create(input)
    //             .then(collection.addEntity.bind(collection))
    //             .then(function(data){
    //                 data.entity = contentElements[1];
    //                 return data;
    //             }).then(collection.addEntity.bind(collection))
    //             .then(function(data){
    //                 data.entity = contentElements[0];
    //                 return data;
    //             })
    //             .then(collection.removeEntity.bind(collection))
    //             .then(function(data){
    //                 assert.ok(data.contentElements.length == 1);
    //                 assert.ok(data.contentElements[0].href == contentElements[1].href);
    //                 return data;
    //             })
    //             .then(collection.delete)
    //             .then(function(){done()})
    //             .catch(console.log);
    //     });
    // });

    // describe("#publish() collection", function(){
    //     it("should publish the collection", function(done){
    //         var input = {
    //             sessionId: AEM.genUUID(),
    //             metadata: metadata
    //         };
    //         collection.create(input)
    //             .then(collection.requestMetadata)
    //             .then(collection.publish)
    //             //.then(collection.delete)
    //             .then(function(data){done()})
    //             .catch(console.log)
    //     });
    // });

});