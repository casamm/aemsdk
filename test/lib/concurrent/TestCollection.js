var AEMM = require("../../../lib/aemm");
var collection = new AEMM.Collection();
var path = require("path");
var publicationId = "192a7f47-84c1-445e-a615-ff82d92e2eaa";
var datums = [0,1,2,3,4,5,6,7,8,9].map(function(item, index){
    return {
        schema: { entityName: "demo_" + index, entityType: AEMM.Collection.TYPE, publicationId: publicationId, title: "demo_" + index, productIds: ["ag.casa.demo"]},
        images: [ {file: path.join(__dirname, "articles/thumbnail_" + index + ".jpg"), path: "images/thumbnail"},
                  {file: path.join(__dirname, "articles/thumbnail_" + index + ".jpg"), path: "images/background"} ]
    };
});

describe("Collections", function(){

    it("should create collections and publish in multiple job requests", function(done){
        this.timeout(0);
        Promise.all(datums.map(function(data){
            return collection.create(data)
                .then(collection.uploadImages)
                .then(collection.update)
                .then(collection.seal)
                .then(collection.publish)
        })).then(function(result){done()})
            .catch(console.error);
    });

    it("should create collections and publish in a single job request", function(done){
        this.timeout(0);
        Promise.all(datums.map(function(data){
            return collection.create(data)
                .then(collection.uploadImages)
                .then(collection.update)
                .then(collection.seal)
        })).then(function(result){
            var temp = {entities: []};
            result.forEach(function(data){
                temp.entities.push({href: "/publication/" + data.schema.publicationId + "/" + data.schema.entityType + "/" + data.schema.entityName + ";version=" + data.schema.version})
            });
            return collection.publish(temp);
        }).then(function(result){
            console.log(result);
            done();
        }).catch(console.error);
    });

    it("should unpublish collections in a single job request", function(done){
        this.timeout(0);
        Promise.all(datums.map(function(data){
            return collection.requestMetadata(data);
        })).then(function(result){
            var temp = {entities: []};
            result.forEach(function(data){
                temp.entities.push({href: "/publication" + data.schema.publicationId + "/" + data.schema.entityType + "/" + data.schema.entityName + ";version=" + data.schema.version})
            });
            return collection.unpublish(temp)
        }).then(function(){
            done();
        }).catch(console.error);
    });

    it("should unpublish collections in multiple job requests", function(done){
        this.timeout(0);
        Promise.all(datums.map(function(data){
            return collection.requestMetadata(data)
                .then(collection.unpublish);
        })).then(function(){
            done();
        }).catch(console.error);
    });

    it("should delete collections using requestList", function(done){
        var datum = { schema: { entityType: AEMM.Collection.TYPE, publicationId: publicationId}};
        collection.requestList(datum)
            .then(function(result){
                result.entities.forEach(function(data){
                    collection.requestMetadata(data)
                        .then(collection.delete)
                        .then(function(){done()});
                });
            }).catch(console.error);
    });

    it("should delete all collections using local data", function(done){
        Promise.all(datums.map(function(data){
            return collection.requestMetadata(data)
                .then(collection.delete);
        })).then(function(){done()})
            .catch(console.error);

    });

});

