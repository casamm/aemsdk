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
                entityType: AEM.Card.TYPE,
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
        var body = {
            schema: {
                entityType: AEM.Card.TYPE,
                publicationId: publicationId
            }
        };
        cardTemplate.requestList(body)
            .then(function(result){
                console.log(result);
                result.cardTemplates.forEach(function(item){
                     
                });
            })
            .catch(console.error);
    });

});