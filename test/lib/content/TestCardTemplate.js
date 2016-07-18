var assert = require('assert');
var AEMM = require("../../../lib/aemm");
var cardTemplate = new AEMM.CardTemplate();

var publicationId = "b5bacc1e-7b55-4263-97a5-ca7015e367e0";

describe('#CardTemplate()', function () {
    it('should be instantiated', function () {
        assert.ok(cardTemplate, "constructor test");
    });

    it('should requestList', function(done){
        var body = {
            schema: {
                entityType: AEMM.CardTemplate.TYPE,
                publicationId: publicationId
            }
        };
        cardTemplate.requestList(body)
            .then(function(result){
                assert.ok(result.entities);
                done();
            })
            .catch(console.error);
    });

    it('should requestList with query', function(done){
        var body = {
            schema: {
                publicationId: publicationId
            },
            query: "pageSize=100&q=entityType==cardTemplate"
        };
        cardTemplate.requestList(body)
            .then(function(result){
                assert.ok(result.entities);
                done();
            })
            .catch(console.error);
    });

    it('should requestList with metadata', function(done){
        this.timeout(5000);
        var body = {
            schema: {
                entityType: AEMM.CardTemplate.TYPE,
                publicationId: publicationId
            }
        };
        cardTemplate.requestList(body)
            .then(function(result){
                Promise.all(result.entities.map(function(item){
                    var matches = item.href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                    var body = {
                        schema: {
                            entityType: matches[1],
                            entityName: matches[2],
                            publicationId: publicationId
                        }
                    };
                    return cardTemplate.requestMetadata(body);
                })).then(function(data){
                        assert.ok(result.entities.length == data.length);
                        done();
                    })
                    .catch(console.error);
            })
            .catch(console.error);
    });

    it('should requestList with status', function(done){
        this.timeout(5000);
        var body = {
            schema: {
                entityType: AEMM.CardTemplate.TYPE,
                publicationId: publicationId
            }
        };
        cardTemplate.requestList(body)
            .then(function(result){

                Promise.all(result.entities.map(function(item){
                    var matches = item.href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                    var body = {
                        schema: {
                            entityType: matches[1],
                            entityName: matches[2],
                            publicationId: publicationId
                        }
                    };
                    return cardTemplate.requestStatus(body);
                })).then(function(items){
                    items.forEach(function(item){
                        assert.ok(item.status);
                    });
                    assert.ok(items.length, result.entities.length == items.length);
                    done();
                });
            });
    });

    it('should requestMetadata', function(done){
        this.timeout(5000);
        var body = {
            schema: {
                entityType: AEMM.CardTemplate.TYPE,
                entityName: "defaultCardTemplate",
                publicationId: publicationId
            }
        };

        cardTemplate.requestMetadata(body)
            .then(function(data){
                assert.ok(data.schema);
                done();
            })
            .catch(console.error);
    });

    it('should requestStatus', function(done){
        var body = {
            schema: {
                entityType: AEMM.CardTemplate.TYPE,
                entityName: "defaultCardTemplate",
                publicationId: publicationId
            }
        };
        cardTemplate.requestStatus(body)
            .then(function(data){
                assert.ok(data.status);
                done();
            })
            .catch(console.error);
    });

});