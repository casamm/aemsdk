describe('Authorization', function() {

    var assert;
    var credentials;
    var authentication;
    var authorization;

    before(function() {
        assert = require('assert');
        credentials = require('../config/credentials.json');
        var Authentication = require("../../authenticationService/Authentication");

        authentication = new Authentication(credentials);
    });

    describe('#requestPermissions()', function () {

        it('should return permissions for a publication', function (done) {

            authentication.requestToken().then(function(data){

                var Authorization = require("../../authorizationService/Authorization");

                var session = {
                    "requestId": require("../../userService/User").genUUID(),
                    "sessionId": require("../../userService/User").genUUID()
                };
                authorization = new Authorization(credentials, data, session);

                authorization.requestPermissions("b5bacc1e-7b55-4263-97a5-ca7015e367e0").then(function(permissions){
                    assert.notEqual(permissions.length, 0, "permissions denied");
                    done();
                }, function(error){
                    console.log(error);
                });

            }, function(error){
                console.log(error);
                done();
            });

        });
    });
    

    describe('#verifyRoles()', function () {
        it('should verify roles', function (done) {

            authentication.requestToken().then(function(data){

                var Authorization = require("../../authorizationService/Authorization");
                var session = {"requestId": require("../../userService/User").genUUID(), "sessionId": require("../../userService/User").genUUID()};
                authorization = new Authorization(credentials, data, session);

                authorization.requestPermissions("b5bacc1e-7b55-4263-97a5-ca7015e367e0").then(function(permissions){
                    var roles = authorization.verifyRoles(["product_view", "producer_preview", "product_add"], permissions);
                    assert.equal(roles.length, 0);
                    done();
                }, function(error){
                    console.log(error);
                });

            }, function(error){
                console.log(error);
                done();
            });

        });
    });

    after(function(){
        authentication = null;
        assert = null;
    });

});