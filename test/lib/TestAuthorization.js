describe('Authorization', function() {

    var assert = require('assert');
    var AEM = require("../../lib/aem");
    AEM.config.credentials = require('../lib/credentials.json');

    var authorization = new AEM.Authorization();
    var publicationId = "b5bacc1e-7b55-4263-97a5-ca7015e367e0";

    describe('#requestPermissions()', function() {

        it('should return list of permissions for all publications', function (done) {
            var body = {};
            authorization.requestPermissions(body).then(function(data){
                assert.ok(data, "error");
                assert.ok(data.client, "permissions not returned");
                done();
            }).catch(console.error);
        });
    });

    describe('#verifyPermissions()', function() {
        it('should return permissions for a publication', function (done) {
            var body = {
                entity: {publicationId: publicationId}

            };
            authorization.requestPermissions(body)
                .then(authorization.verifyPermissions)
                .then(function(data){
                    assert.notEqual(data.length, 0, "permissions denied");
                    done();
                })
                .catch(console.error);
        });
    });

    describe('#verifyRoles()', function () {
        it('should verify roles', function () {
            var body = {
                permissions: ["product_view", "producer_preview", "product_add"],
                roles: ["product_view"]
            };

            authorization.verifyRoles(body);
            assert.equal(body.roles.length, 0, "roles not zero");
        });

        it('another test', function(){
            var body = {
                permissions: ["product_view", "product_add", "analytics_view"],
                roles: ["product_view", "producer_preview"]
            };
            authorization.verifyRoles(body);
            assert.equal(body.roles.length, 1, "roles not 1");
            assert.equal(body.roles[0], 'producer_preview', "roles not equal to producer_preview");
        });

        it('check for master_admin', function(){
            var body = {
                permissions: ["master_admin"],
                roles: ["product_view", "producer_preview", "product_add"]
            };
            authorization.verifyRoles(body);
            assert.equal(body.roles.length, 0, "roles not zero");
        });

        it('should verify roles', function () {
            var body = {
                permissions: ["product_view", "producer_preview", "product_add"],
                roles: ["product_add", "producer_preview"]
            };
            authorization.verifyRoles(body);
            assert.equal(body.roles.length, 0, "roles not zero");
        });

        it('should verify roles', function () {
            var body = {
                permissions: ["product_view", "producer_preview", "product_add"],
                roles: ["abc", "product_add"]
            };
            authorization.verifyRoles(body);
            assert.equal(body.roles.length, 1, "roles not 1");
        });
    });

    describe('#verify()', function () {
        it("should verify in one go", function(done){
            var body = {
                entity: {
                    publicationId: publicationId
                },
                roles: ["producer_content_add"]
            };
            authorization.verify(body)
                .then(function(){done()})
                .catch(console.error);

        })
    });

});