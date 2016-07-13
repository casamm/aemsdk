var assert = require('assert');
var AEM = require("../../../lib/aem");

var publication = new AEM.Publication();
var authorization = AEM.authorization;
var publicationId = "b5bacc1e-7b55-4263-97a5-ca7015e367e0";

describe('Publication', function() {
    
    it("should construct", function(){
        assert.ok(publication);
    });

    it("should requestStatus", function(done){
        var body = {
            schema: {
                entityName: publicationId,
                entityType: AEM.Publication.TYPE,
                publicationId: publicationId
            },
            permissions: ["publication_admin"]
        };

        authorization.verify(body)
            .then(publication.requestStatus)
            .then(function(result){
                assert.ok(result.status);
                done();
            })
            .catch(console.error);
    });

    it("should preflight", function(done){
        this.timeout(10000);
        var body = {
            schema: {
                publicationId: publicationId
            },
            notify: function(result) {
                //console.log(result.status);
            }
        };
        publication.preflight(body)
            .then(publication.addWorkflowObserver)
            .then(function(result){
                done();
            })
            .catch(console.error);
    });

    it("should requestList with metadata", function(done){
        var body = {
            schema: {
                publicationId: publicationId
            },
            permissions: ["publication_admin"]
        };

        authorization.requestPermissions(body)
            .then(authorization.verifyPermissions)
            .then(authorization.verifyRoles)
            .then(function(result){
                var promises = [];
                result.subscriber.masters.forEach(function(item){
                    item.publications.forEach(function(item){
                        var body = {
                            schema: {
                                entityName: item.id,
                                publicationId: item.id,
                                entityType: AEM.Publication.TYPE
                            }
                        };
                        promises.push(publication.requestMetadata(body));
                    });
                });

                Promise.all(promises).then(function(result){
                    assert.ok(result);
                    assert.ok(result.length);
                    done();
                }).catch(console.error);
            })
            .catch(console.error);
    });

    it("should requestList with status", function(done){
        var body = {
            schema: {
                publicationId: publicationId
            },
            permissions: ["publication_admin"]
        };

        authorization.requestPermissions(body)
            .then(authorization.verifyPermissions)
            .then(authorization.verifyRoles)
            .then(function(result){
                var promises = [];
                result.subscriber.masters.forEach(function(item){
                    item.publications.forEach(function(item){
                        var body = {
                            schema: {
                                entityName: item.name,
                                publicationId: item.id,
                                entityType: AEM.Publication.TYPE
                            }
                        };
                        promises.push(publication.requestStatus(body));
                    });
                });

                return Promise.all(promises)
                    .then(function(result){
                        result.forEach(function(item){
                            assert.ok(item.status);
                        });
                        done();
                    }).catch(console.error);
            })
            .catch(console.error);
    });
    
});