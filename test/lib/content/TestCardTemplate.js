var assert = require('assert');
var AEM = require("../../../lib/aem");
AEM.config.credentials = require('../../lib/credentials.json');
var cardTemplate = new AEM.CardTemplate();

var publicationId = "b5bacc1e-7b55-4263-97a5-ca7015e367e0";

describe('#CardTemplate()', function () {
    it('should be instantiated', function () {
        assert.ok(cardTemplate, "constructor test");
    });

    it('should requestList', function(done){
        var body = {
            schema: {
                entityType: AEM.CardTemplate.TYPE,
                publicationId: publicationId
            }
        };
        cardTemplate.requestList(body)
            .then(function(result){
                assert.ok(result.cardTemplates);
                done();
            })
            .catch(console.error);
    });

    it('should requestList with query', function(done){
        var body = {
            schema: {
                publicationId: publicationId
            },
            query: "entity?pageSize=100&q=entityType==cardTemplate"
        };
        cardTemplate.requestList(body)
            .then(function(result){
                assert.ok(result.cardTemplates);
                done();
            })
            .catch(console.error);
    });

    it('should requestList with metadata', function(done){
        this.timeout(5000);
        var body = {
            schema: {
                entityType: AEM.CardTemplate.TYPE,
                publicationId: publicationId
            }
        };
        cardTemplate.requestList(body)
            .then(function(result){
                var promises = [];
                result.cardTemplates.forEach(function(item){
                    var matches = item.href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                    var body = {
                        schema: {
                            entityType: matches[1],
                            entityName: matches[2],
                            publicationId: publicationId
                        }
                    };
                    promises.push(cardTemplate.requestMetadata(body));
                });
                Promise.all(promises)
                    .then(function(data){
                        assert.ok(result.cardTemplates.length == data.length);
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
                entityType: AEM.CardTemplate.TYPE,
                publicationId: publicationId
            }
        };
        cardTemplate.requestList(body)
            .then(function(result){
                var promises = [];

                result.cardTemplates.forEach(function(item){
                    var matches = item.href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                    var body = {
                        schema: {
                            entityType: matches[1],
                            entityName: matches[2],
                            publicationId: publicationId
                        }
                    };
                    promises.push(cardTemplate.requestStatus(body));
                });

                Promise.all(promises).then(function(items){
                    items.forEach(function(item){
                        assert.ok(item.status);
                    });
                    assert.ok(items.length, result.cardTemplates.length == items.length);
                    done();
                });
            });
    });

    it('should requestMetadata', function(done){
        this.timeout(5000);
        var body = {
            schema: {
                entityType: AEM.CardTemplate.TYPE,
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
                entityType: AEM.CardTemplate.TYPE,
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