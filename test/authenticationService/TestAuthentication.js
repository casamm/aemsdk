describe('Authentication', function() {

    var authentication;
    var assert;
    var credentials;

    before(function() {
        credentials = require('../config/credentials.json');
        var Authentication = require("../../authenticationService/Authentication");
        assert = require('assert');

        authentication = new Authentication(credentials);
    });

    describe('#requestToken()', function () {
        it('should return a token', function (done) {
            authentication.requestToken().then(function(data){
                assert.ok(data);
                assert.ok(data.access_token);
                assert.ok(data.refresh_token);
                done();
            }, function(error){
                console.log(error);
            });
        });
    });

    after(function(){
        authentication = null;
        assert = null;
        credentials = null;
    });

});