describe('Authorization', function() {

    var assert = require('assert');
    var AEM = require("../../lib/aem");
    AEM.config.credentials = require('../lib/credentials.json');

    describe('#requestPermissions()', function() {
        it('should return list of permissions for all publications', function (done) {
            AEM.authorization.requestPermissions().then(function(data){
                assert.ok(data, "permissions denied");
                done();
            }, function(error){
                console.log(error);
            });
        });
    });

    // describe('#verifyPermissions()', function() {
    //     it('should return permissions for a publication', function (done) {
    //         AEM.authorization.requestPermissions().then(function(data){
    //             var permissions = AEM.authorization.verifyPermissions("b5bacc1e-7b55-4263-97a5-ca7015e367e0");
    //             assert.notEqual(permissions.length, 0, "permissions denied");
    //             done();
    //         }, function(error){
    //             console.log(error);
    //         });
    //     });
    // });
    //
    // describe('#verifyRoles()', function () {
    //     it('should verify roles', function (done) {
    //         AEM.authorization.requestPermissions().then(function(permissions){
    //             var permissions = AEM.authorization.verifyPermissions("b5bacc1e-7b55-4263-97a5-ca7015e367e0");
    //             var roles = AEM.authorization.verifyRoles(["product_view", "producer_preview", "product_add"]);
    //             assert.equal(roles.length, 0);
    //             done();
    //         }, function(error){
    //             console.log(error);
    //         });
    //     });
    // });

    after(function(){
        aem = null;
    });

});