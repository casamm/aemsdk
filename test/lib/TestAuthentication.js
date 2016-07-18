describe('Authentication', function() {

    var assert = require('assert');
    var AEMM = require("../../lib/aemm");
    var authentication = new AEMM.Authentication();

    it('should return a token', function (done) {
        var body = {};
        authentication.requestToken(body)
            .then(function(data){
                assert.ok(data);
                assert.ok(data.authentication.access_token);
                assert.ok(body.authentication.access_token == data.authentication.access_token);
                done();
            })
            .catch(console.error);
    });

    it('should return a cached token', function (done) {
        var body = {};
        var access_token;
        authentication.requestToken(body)
            .then(function(data){
                access_token = data.authentication.access_token;
                return {};
            })
            .then(authentication.getToken)
            .then(function(data){
                assert.ok(data.authentication.access_token == access_token);
                done();
            })
            .catch(console.error);
    });

});