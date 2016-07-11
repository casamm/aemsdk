var assert = require('assert');
var AEM = require("../../../lib/aem");
var article = new AEM.Article();

var entityName = "test1-a";
var publicationId = "b5bacc1e-7b55-4263-97a5-ca7015e367e0";

var path = require("path");

describe('#Article()', function () {
    
    it('should be instantiated', function () {
        assert.ok(article, "constructor test");
    });

    it('should iterate a directory', function(done){
        this.timeout(0);
        body = {
            path: path.join(__dirname, "../../../lib")
        };
        article.iterateArticleDirectory(body)
            .then(function(result){console.log(result); done()})
            .catch(console.error);
    });

    it('should create a zip', function(done){
        this.timeout(0);
        var fs = require('fs');
        var options = {
            root: path.join(__dirname, "../resources/html"),
            folder: "article",
            filename: "article.zip"
        };

        article.zip(options)
            .then(function(result){
                assert.ok(fs.existsSync(path.join(options.root, options.filename)));
                done();
            })
            .catch(console.error);
    });

    it('should requestList', function(done){
        var body = {
            schema: {
                entityType: AEM.Article.TYPE,
                publicationId: publicationId
            }
        };
        article.requestList(body)
            .then(function(result){
                assert.ok(result);
                assert.ok(result.schema);
                assert.ok(result.articles);
                done();
            })
            .catch(console.error);
    });

    it('should requestList with query', function(done){
        var body = {
            schema: {
                publicationId: publicationId
            },
            query: "entity?pageSize=100&q=entityType==article"
        };
        article.requestList(body)
            .then(function(result){
                assert.ok(result.articles);
                done();
            })
            .catch(console.error);
    });

    it('should requestList with metadata', function(done){
        var body = {
            schema: {
                entityType: AEM.Article.TYPE,
                publicationId: publicationId
            }
        };
        article.requestList(body)
            .then(function(result){
                var promises = [];
                result.articles.forEach(function(item){
                    var matches = item.href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                    var body = {
                        schema: {
                            entityType: matches[1],
                            entityName: matches[2],
                            publicationId: publicationId
                        }
                    };
                    promises.push(article.requestMetadata(body));
                });
                Promise.all(promises).then(function(data){
                    assert.ok(result.articles.length == data.length);
                    done();
                }).catch(console.error);
            })
            .catch(console.error);
    });

    it('should requestList with status', function(done){
        var body = {
            schema: {
                entityType: AEM.Article.TYPE,
                publicationId: publicationId
            }
        };
        article.requestList(body)
            .then(function(result){
                var promises = [];
                result.articles.forEach(function(item){
                    var matches = item.href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                    var body = {
                        schema: {
                            entityType: matches[1],
                            entityName: matches[2],
                            publicationId: publicationId
                        }
                    };
                    promises.push(article.requestStatus(body));
                });
                Promise.all(promises).then(function(data){
                    assert.ok(result.articles.length == data.length);
                    data.forEach(function(item){
                        assert.ok(item.status);
                    });
                    done();
                }).catch(console.error);
            })
            .catch(console.error);
    });

    it('should requestManifest', function(done){
        var body = {
            schema: {
                entityName: entityName,
                entityType: AEM.Article.TYPE,
                publicationId: publicationId
            }
        };
        article.requestMetadata(body)
            .then(function(result){
                article.requestManifest(result)
                    .then(function(entity){
                        assert.ok(entity.contentUrl);
                        done();
                    })
                    .catch(console.error);
            })
            .catch(console.error);
    });

    it('should requestMetadata', function(done){
        this.timeout(5000);
         var body = {
             schema: {
                 entityName: entityName,
                 entityType: AEM.Article.TYPE,
                 publicationId: publicationId
             }
         };
        article.requestMetadata(body)
            .then(function(result){
                assert.ok(result.schema);
                done();
            })
            .catch(console.error);
    });

    it('should requestStatus', function(done){
        var body = {
            schema: {
                entityName: entityName,
                entityType: AEM.Article.TYPE,
                publicationId: publicationId
            }
        };
        article.requestStatus(body)
            .then(function(result){
                assert.ok(result.status);
                done();
            })
            .catch(console.error);
    });

    it('should publish', function(done){
        this.timeout(0);
        var body = {
            schema: {
                entityName: entityName,
                entityType: AEM.Article.TYPE,
                publicationId: publicationId
            }
        };
        article.requestMetadata(body)
            .then(article.publish)
            .then(function(result){
                assert.ok(result);
                assert.ok(result.workflowId);
                done();
            })
            .catch(console.error);
    });

    it('should upload and delete', function(done){
        this.timeout(0);
        var path = require("path");
        var body = {
            schema: {
                entityName: "nodejs",
                entityType: "article",
                title: "article from nodejs",
                publicationId: publicationId
            },
            file: {path: path.join(__dirname, '../resources/html/art.article'), type: "folio"}
        };
        article.create(body)
            .then(article.uploadArticle)
            .then(function(result){
                return new Promise(function(resolve, reject){
                    var id = setInterval(function(){
                        article.requestStatus(result).then(function(data){
                            switch(data.status[0].eventType) {
                                case "progress": break;
                                case "success": clearInterval(id); resolve(data); break;
                                case "failure": clearInterval(id); reject(data); break;
                            }
                        })
                    }, 1000);
                });
            })
            .then(article.requestMetadata)
            .then(article.delete)
            .then(function(result){
                done();
            })
            .catch(console.error);
    });

    it('should upload, publish, unpublish and delete', function(done){
        this.timeout(0);
        var body = {
            schema: {
                entityName: "nodejs",
                entityType: "article",
                title: "article from nodejs",
                publicationId: publicationId
            }
        };

        article.create(body)
            .then(function(result){
                result.file = {path: path.join(__dirname, '../resources/image/thumbnail.png'), type: "thumbnail"};
                return result;
            })
            .then(article.uploadImage)
            .then(article.update)
            .then(article.seal)
            .then(function(result){
                result.file = {path: path.join(__dirname, '../resources/html/art.article'), type: "folio"};
                return result;
            })
            .then(article.uploadArticle)
            .then(function(result){
                return new Promise(function(resolve, reject){
                    var id = setInterval(function(){
                        article.requestStatus(result).then(function(data){
                            switch(data.status[0].eventType) {
                                case "progress": break;
                                case "success": clearInterval(id); resolve(data); break;
                                case "failure": clearInterval(id); reject(data); break;
                            }
                        }).catch(function(error){clearInterval(id); reject(error)});
                    }, 1000);
                });
            })
            .then(article.requestMetadata)
            .then(article.publish)
            .then(function(result){
                return new Promise(function(resolve, reject){
                    var id = setInterval(function(){
                        article.requestStatus(result).then(function(data){
                            switch(data.status[0].eventType) {
                                case "progress": break;
                                case "success": clearInterval(id); resolve(data); break;
                                case "failure": clearInterval(id); reject(data); break;
                            }
                        }).catch(function(error){clearInterval(id); reject(error)})
                    }, 1000)
                });
            })
            .then(function(result){
                return new Promise(function(resolve, reject){
                    var id = setInterval(function(){
                        article.unpublish(result).then(function(data){clearInterval(id); resolve(data)});
                    }, 1000);
                });
            })
            .then(function(result){
                return new Promise(function(resolve, reject){
                    var id = setInterval(function(){
                        article.delete(result).then(function(data){clearInterval(id); resolve(data)})
                    }, 1000);
                })
            })
            .then(function(result){
                done();
            })
            .catch(console.error);
    });
});