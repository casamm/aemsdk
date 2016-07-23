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
         var datum = {
             schema: {
                 entityType: "sharedContent",
                 entityName: "sc_one",
                 publicationId: publicationId
             },
             abcsharedContents: [
                 {file: path.join(__dirname, '../resources/shared/js/main.js'), path: "js/main.js"},
                 {file: path.join(__dirname, '../resources/shared/js/main.js'), path: "js/main_two.js"}
             ],
             sharedContents: [
                 AEMM.SharedContent.listdir(path.join(__dirname, '../resources/shared/js/'))
             ]
         };
         sharedContent.create(datum)
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

    it("should iterate directory", function(done){
        AEMM.SharedContent.listdir(path.join(__dirname, '../resources/shared/js/'))
            .then(function(result){
                result.forEach(function(item){
                    assert.ok(item.file);
                    assert.ok(item.path);
                });
                done();
            }).catch(console.error);

    });

    it('should create and link to an article', function(done){
        this.timeout(0);
        var datum = {
            schema: {entityName: "sc_one", entityType: "sharedContent", publicationId: publicationId},
            sharedContents: [
                {file: path.join(__dirname, '../resources/shared/js/main.js'), path: "js/main.js"},
                {file: path.join(__dirname, '../resources/shared/js/main_two.js'), path: "js/main_two.js"}
            ]
        };
        var article_datum = {
            schema: {entityName: "nodejs", entityType: AEMM.Article.TYPE, title: "article from nodejs", publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0"},
            article: { src: path.join(__dirname, "../resources/shared/sharedHTML")},
            images: [{file: path.join(__dirname, '../resources/image/thumbnail.png'), path: "images/thumbnail", sizes: '2048, 1020, 1536, 1080, 768, 640, 540, 320'}]
        };

        var article = new AEMM.Article();

        function createArticle() {
            return new Promise(function(resolve, reject){
                article.create(article_datum)
                    .then(article.buildArticle)
                    .then(article.uploadArticle)
                    .then(article.addStatusObserver)
                    .then(article.requestMetadata)
                    .then(resolve)
                    .catch(reject);
            });
        }

        function createSharedContent() {
            return new Promise(function(resolve, reject){
                sharedContent.create(datum)
                    .then(sharedContent.requestMetadata)
                    .then(sharedContent.uploadSharedContent)
                    .then(sharedContent.seal)
                    .then(resolve)
                    .catch(reject);
            });
        }

        Promise.all([createArticle(), createSharedContent()])
            .then(function(result){
                result[0].sharedContent = result[1].schema._links.contentUrl;
                article.linkSharedContent(result[0])
                    .then(article.seal)
                    .then(article.requestEntity)
                    .then(function(data){
                        var sc = AEMM.matchContentUrl(result[0].sharedContent.href)[4];
                        var found = false;
                        for(var i=0; i<data.length; i++) {
                            if(data[i].href == sc) {found = true; break}
                        }
                        assert.ok(found);
                        return sharedContent.delete(result[1]).then(function(){return result[0]});
                    })
                    .then(article.delete)
                    .then(function(){
                        console.log("path for sharedContent: ../" + AEMM.matchContentUrl(article_datum.sharedContent.href)[4]);
                        done();
                    }).catch(console.error);
            }).catch(console.error);
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
            .then(function(result){ // downloadFiles
                return Promise.all(result.map(function(item){
                    return sharedContent.downloadFiles(item);
                })).then(function(data){
                    data.forEach(function(item){
                        item.files.forEach(function(file){
                            fs.existsSync(file) && fs.unlink(file);
                        });
                    })
                })
            })
            .then(function(){
                done();
            })
            .catch(console.error);
    });

});