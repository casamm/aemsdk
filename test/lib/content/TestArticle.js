var assert = require('assert');
var AEM = require("../../../lib/aem");
var article = new AEM.Article();

var fs = require("fs");
var path = require("path");
var datum;

describe('#Article()', function () {

    before(function() {
        datum = {
            schema: {
                entityName: "nodejs",
                entityType: "article",
                title: "article from nodejs",
                publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0"
            },
            article: {
                src: path.join(__dirname, "../resources/html/article"),
                generateManifest: true, // default is true
                deleteSourceDir: false // default is false
            },
            images: [
                {path: path.join(__dirname, '../resources/image/thumbnail.png'), type: "thumbnail", sizes: '2048, 1020, 1536, 1080, 768, 640, 540, 320'},
                {path: path.join(__dirname, '../resources/image/socialSharing.png'), type: "socialSharing"}
            ],
            notify: function(result){
                if(result.length) { // status
                    //console.log(Math.round(result[0].numerator/result[0].denominator * 100));
                } else { // workflow
                    //console.log(result.status)
                }
            }
        };
    });

    it('should be instantiated', function () {
        assert.ok(article, "constructor test");
    });

    it('should requestManifest', function(done){
        this.timeout(0);
        article.create(datum)
            .then(article.buildArticle)
            .then(article.uploadArticle)
            .then(article.addStatusObserver)
            .then(article.requestMetadata)
            .then(article.requestManifest)
            .then(function(result){
                assert.ok(result.contentUrl);
                return result;
            })
            .then(article.delete)
            .then(function(){done()})
            .catch(console.error);
    });

    it('should requestMetadata', function(done){
        article.create(datum)
            .then(article.requestMetadata)
            .then(function(result){
                assert.ok(result.schema);
                return result;
            })
            .then(article.delete)
            .then(function(){done()})
            .catch(console.error);
    });

    it('should requestStatus', function(done){
        article.create(datum)
            .then(article.requestStatus)
            .then(function(result){
                assert.ok(result.status);
                return result;
            })
            .then(article.delete)
            .then(function(){done()})
            .catch(console.error);
    });

    it('should build an article file', function(done){
        article.buildArticle(datum)
            .then(function(result){
                assert.ok(fs.existsSync(result.article.path)); // archive exists
                assert.ok(fs.existsSync(datum.article.src) != datum.article.deleteSourceDir); // if deleteSourceDirectory folder got deleted
                assert.ok(fs.existsSync(path.join(datum.article.src, "/manifest.xml")) != datum.article.generateManifest); //if generated, it's deleted
                fs.unlinkSync(result.article.path);
                done();
            })
            .catch(console.error)
    });

    it('should create, build an article file and publish', function(done){
        this.timeout(0);
        article.create(datum)
            .then(article.buildArticle)
            .then(article.uploadArticle)
            .then(article.addStatusObserver)
            .then(article.requestMetadata)
            .then(article.delete)
            .then(function(){done()})
            .catch(console.error)
    });

    it('should upload an image and delete', function(done){
        this.timeout(0);
        article.create(datum)
            .then(article.uploadImages)
            .then(article.update)
            .then(article.seal)
            .then(article.delete)
            .then(function(result){
                done();
            })
            .catch(console.error);
    });

    it('should upload an image and article, publish, unpublish, delete', function(done){
        this.timeout(0);
        article.create(datum)
            .then(article.uploadImages)
            .then(article.update)
            .then(article.seal) // version change
            .then(article.buildArticle)
            .then(article.uploadArticle)
            .then(article.addStatusObserver) // uploadArticle progress observer
            .then(article.requestMetadata) // request latest schema version
            .then(article.publish)
            .then(article.addWorkflowObserver) // publish workflow observer
            .then(article.unpublish)
            .then(article.addWorkflowObserver)
            .then(article.delete)
            .then(function(){done()})
            .catch(console.error);
    });

    it('should requestList', function(done){
        article.requestList(datum)
            .then(function(result){
                assert.ok(result);
                assert.ok(result.schema);
                assert.ok(result.entities);
                done();
            })
            .catch(console.error);
    });

    it('should requestList with query', function(done){
        datum.query = "pageSize=100&q=entityType==article";
        article.requestList(datum)
            .then(function(result){
                assert.ok(result.entities);
                done();
            })
            .catch(console.error);
    });

    it('should requestList with metadata', function(done){
        article.requestList(datum)
            .then(function(result){
                Promise.all(result.entities.map(function(item){
                    var matches = item.href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                    var data = {
                        schema: {
                            entityType: matches[1],
                            entityName: matches[2],
                            publicationId: result.schema.publicationId
                        }
                    };
                    return article.requestMetadata(data);
                })).then(function(data){
                        assert.ok(result.entities.length == data.length);
                        done();
                    }).catch(console.error);
            })
            .catch(console.error);
    });

    it('should requestList with status', function(done){
        article.requestList(datum)
            .then(function(result){
                Promise.all(result.entities.map(function(item){
                    var matches = item.href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                    var data = {
                        schema: {
                            entityType: matches[1],
                            entityName: matches[2],
                            publicationId: result.schema.publicationId
                        }
                    };
                    return article.requestStatus(data);
                })).then(function(data){
                    assert.ok(result.entities.length == data.length);
                    data.forEach(function(item){
                        assert.ok(item.status);
                    });
                    done();
                }).catch(console.error);
            })
            .catch(console.error);
    });

});