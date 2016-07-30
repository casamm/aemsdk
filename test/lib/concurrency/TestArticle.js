var assert = require('assert');
var AEMM = require("../../../lib/aemm");
var article = new AEMM.Article();
var publicationId = "192a7f47-84c1-445e-a615-ff82d92e2eaa";

var fs = require("fs");
var path = require("path");

var datums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function(item, index){
    return {
        schema: { entityName: "demo_" + index, entityType: AEMM.Article.TYPE, publicationId: publicationId, title: "demo_" + index},
        article: {src: path.join(__dirname, "articles/" + index)},
        images: [ {file: path.join(__dirname, "articles/thumbnail_" + index + ".jpg"), path: "images/thumbnail"}],
        notify: function(status) {
            //console.log(status.numerator, status.subAspect);
        }
    };
});

describe("article", function(){

    it('should build articles', function(done){
        this.timeout(0);
        Promise.all(datums.map(function(data){
            return article.buildArticle(data)
                .catch(console.error);
        })).then(function(){
            done();
        }).catch(console.error);
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
                .then(AEMM.publish.enqueue)
                .then(function(body){
                    //console.log(body.schema.title, 'done');
                })
        })).then(function(result){
            done();
        })
        .catch(console.error);
    });

    it('should delete all using requestList', function(done){
        this.timeout(0);
        var datum = {schema: {entityType: AEMM.Article.TYPE, publicationId: publicationId}};

        article.requestList(datum)
            .then(function(result){
                return Promise.all(result.entities.map(function(data){
                    return article.requestMetadata(data)
                        .then(AEMM.unpublish.enqueue)
                        .then(article.delete);
                }))
            })
            .then(function(){
                done();
            })
            .catch(console.error);
    });

    it('should delete all using local data', function(done){
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