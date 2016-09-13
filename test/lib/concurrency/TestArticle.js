var assert = require('assert');
var AEMM = require("../../../lib/aemm");
var article = new AEMM.Article();
var publicationId = "192a7f47-84c1-445e-a615-ff82d92e2eaa";
var authentication = new AEMM.Authentication();

var fs = require("fs");
var path = require("path");

var datums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function(item, index){
    return {
        schema: { entityName: "article_" + index, entityType: AEMM.Article.TYPE, publicationId: publicationId, title: "article_" + index},
        article: {src: path.join(__dirname, "../../resources/articles/" + index)},
        images: [ {file: path.join(__dirname, "../../resources/articles/thumbnail_" + index + ".jpg"), path: "images/thumbnail"}],
        notify: function(status) {
            // console.log(status.numerator, status.subAspect);
        }
    };
});

before(function(done) {
    authentication.requestToken({})
        .then(function(data) {
            assert.equal(data.access_token, authentication.getToken().access_token);
            done();
        })
        .catch(console.error);
});

describe("article", function(){

    before(function(done) {
        authentication.requestToken({})
            .then(function(data) {
                assert.ok(data.access_token);
                assert.ok(authentication.getToken());
                assert.ok(authentication.getToken().access_token);
                done();
            })
            .catch(console.error);
    });

    xit('should build articles', function(done){
        this.timeout(0);
        Promise.all(datums.map(function(data){
            return article.buildArticle(data)
                .catch(console.error);
        })).then(function(){
            done();
        }).catch(console.error);
    });

    xit('should build an existing article', function(done){
        this.timeout(0);
        var datum = {
            schema: { entityName: "existing", entityType: AEMM.Article.TYPE, publicationId: publicationId, title: "existing"},
            article: {src: path.join(__dirname, "../../resources/articles/existing")},
            images: [{file: path.join(__dirname, "../../resources/articles/existing.jpg"), path: "images/thumbnail"}]
        };
        article.create(datum)
            .then(article.uploadImages)
            .then(article.update)
            .then(article.seal)
            .then(article.buildArticle)
            .then(article.uploadArticle)
            .then(article.addStatusObserver)
            .then(function(){done()})
            .catch(console.error);
    });

    it('should create, build and upload article file', function(done){
        this.timeout(0);
        Promise.all(datums.map(function(data){
            return article.create(data)
                .then(article.uploadImages)
                .then(article.update)
                .then(article.seal)
                .then(article.buildArticle)
                .then(article.uploadArticle)
                .then(article.addStatusObserver)
                .then(article.requestMetadata)
                .then(article.enqueue)
                .catch(function(error){
                    console.log('responding to client:', error.message);
                    return error;
                });
        })).then(function(result){
            article.preflight({schema: {publicationId: datums[0].schema.publicationId}})
                .then(article.addWorkflowObserver)
                .then(function(){
                    done();
                }).catch(console.error);
        });
    });

    it('should delete all using requestList', function(done){
        this.timeout(0);
        var datum = {schema: {entityType: AEMM.Article.TYPE, publicationId: publicationId}};

        article.requestList(datum)
            .then(function(result){
                return Promise.all(result.entities.map(function(data){
                    return article.requestMetadata(data)
                        .then(article.dequeue)
                        .then(article.delete);
                }))
            })
            .then(function(){
                done();
            })
            .catch(console.error);
    });

    xit('should delete all using local data', function(done){
        this.timeout(0);
        Promise.all(datums.map(function(data){
                return article.requestMetadata(data)
                    .then(AEMM.unpublish.enqueue)
                    .then(article.delete);
            })
        ).then(function(){
            done();
        }).catch(console.error);
    });

});