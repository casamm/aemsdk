var assert = require('assert');
var AEM = require("../../../lib/aem");
AEM.config.credentials = require('../../lib/credentials.json');

var layout = new AEM.Layout();
var publicationId = "b5bacc1e-7b55-4263-97a5-ca7015e367e0";

describe('Layout', function() {

    it('should be instantiated', function () {
        assert.ok(layout, 'constructor test');
    });

    it('should create and delete', function(done){
        var body = {
            schema: {
                entityType: "layout",
                entityName: "mylayout",
                title: "layout title",
                publicationId: publicationId
            }
        };

        layout.create(body)
            .then(function(result){
                assert.ok(result.schema.entityName == "mylayout");
                assert.ok(result.schema.entityType == "layout");
                return result;
            })
            .then(layout.delete)
            .then(function(){done()})
            .catch(console.error);
    });

    it('should requestList', function(done){
        var body = {
            schema: {
                entityType: AEM.Layout.TYPE,
                publicationId: publicationId
            }
        };
        layout.requestList(body)
            .then(function(result){
                assert.ok(result);
                assert.ok(result.layouts);
                assert.ok(result.layouts.length);
                done();
            })
            .catch(console.error);
    });

    it('should requestList with metadata', function(done){
        var body = {
            schema: {
                entityType: AEM.Layout.TYPE,
                publicationId: publicationId
            }
        };
        layout.requestList(body)
            .then(function(result){
                var promises = [];
                result.layouts.forEach(function(item){
                    var matches = item.href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                    var body = {
                        schema: {
                            entityType: matches[1],
                            entityName: matches[2],
                            publicationId: publicationId
                        }
                    };
                    promises.push(layout.requestMetadata(body))
                });

                Promise.all(promises).then(function(result){
                    done();
                });
            })
            .catch(console.error);
    });

    it('should requestList with status', function(done){
        var body = {
            schema: {
                entityType: AEM.Layout.TYPE,
                publicationId: publicationId
            }
        };

        layout.requestList(body)
            .then(function(result){
                var promises = [];
                result.layouts.forEach(function(item){
                    var matches = item.href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                    var body = {
                        schema: {
                            entityType: matches[1],
                            entityName: matches[2],
                            publicationId: publicationId
                        }
                    };
                    promises.push(layout.requestStatus(body));
                });
                Promise.all(promises).then(function(result){
                    result.forEach(function(item){
                        assert.ok(item.status);
                        assert.ok(item.status.length);
                    });
                    done();
                });
            })
    });

});