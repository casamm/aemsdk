var assert = require('assert');
var AEM = require("../../../lib/aem");
AEM.config.credentials = require('../../lib/credentials.json');
var article = new AEM.Article();

var entityName = "test1-a";
var publicationId = "b5bacc1e-7b55-4263-97a5-ca7015e367e0";

describe('#Article()', function () {
    
    it('should be instantiated', function () {
        assert.ok(article, "constructor test");
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
                article.requestEntity(result)
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
});