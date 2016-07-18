var assert = require('assert');
var AEMM = require("../../../lib/aemm");

var path = require('path');
var fs = require('fs');

var sharedContent = new AEMM.SharedContent();
var publicationId = "b5bacc1e-7b55-4263-97a5-ca7015e367e0";

describe('SharedContent', function() {

    it('should be instantiated', function () {
        assert.ok(sharedContent, 'constructor test');
    });

    it('should create', function(done){
        this.timeout(0);
         var body = {
             schema: {
                 entityType: "sharedContent",
                 entityName: "sc_one",
                 publicationId: publicationId
             },
             sharedContents: [
                 {path: path.join(__dirname, '../resources/shared/js/main.js'), subpath: "js/main.js"},
                 {path: path.join(__dirname, '../resources/shared/js/main.js'), subpath: "js/main_two.js"}
             ]
         };
         sharedContent.create(body)
             .then(sharedContent.requestMetadata)
             .then(sharedContent.uploadSharedContent)
             .then(sharedContent.seal)
             .then(sharedContent.requestSharedContent)
             .then(sharedContent.downloadFiles)
             .then(sharedContent.delete)
             .then(function(result){
                 done();
             })
             .catch(console.error);
    });

    it('should requestList', function(done){
        var datum = {
            query: "pageSize=100&q=entityType==sharedContent",
            schema: {
                publicationId: publicationId
            }
        };
        sharedContent.requestList(datum)
            .then(function(data){
                done();
            })
            .catch(console.error);
    });

    it('should requestList with requestMetadata', function(done){
        this.timeout(0);
        var datum = {
            query: "pageSize=100&q=entityType==sharedContent",
            schema: {
                publicationId: publicationId
            }
        };
        sharedContent.requestList(datum)
            .then(function(data){
                return Promise.all(data.entities.map(function(item){
                    return sharedContent.requestMetadata(item);
                })).then(function(result){
                    assert.ok(result.length == datum.entities.length);
                    done();
                });
            })
            .catch(console.error);
    });

    it('should requestSharedContent', function(done){
        this.timeout(0);
        var datum = {
            query: "pageSize=100&q=entityType==sharedContent",
            schema: {
                publicationId: publicationId
            }
        };
        sharedContent.requestList(datum)
            .then(function(data){ // requestMetadata
                return Promise.all(data.entities.map(function(item){
                    return sharedContent.requestMetadata(item);
                }))
            })
            .then(function(result){ // requestSharedContent
                return Promise.all(result.map(function(item){
                    return sharedContent.requestSharedContent(item);
                })).then(function(result){
                    result.forEach(function(item){
                        assert.ok(item.contentUrl);
                    });
                    return result;
                })
            })
            .then(function(result){
                return Promise.all(result.map(function(item){
                    return sharedContent.downloadFiles(item);
                })).then(function(data){
                    data.forEach(function(item){
                        item.files.forEach(function(file){
                            fs.unlink(file);
                        })
                    })
                })
            })
            .then(function(){
                done();
            })
            .catch(console.error);
    })

});