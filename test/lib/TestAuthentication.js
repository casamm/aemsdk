describe('Authentication', function() {

    var assert = require('assert');
    var AEMM = require("../../lib/aemm");
    var authentication = new AEMM.Authentication();

    it('should return a token', function (done) {
        authentication.requestToken({})
            .then(function(result){
                assert.ok(result);
                assert.ok(result.access_token);
                done();
            })
            .catch(console.error);
    });

    it('should return a cached token', function (done) {
        this.timeout(0);
        var access_token;
        authentication.requestToken({})
            .then(function(result){
                access_token = result.access_token;
                assert.ok(access_token);
            })
            .then(function(){
                assert.equal(authentication.getToken().access_token, access_token);
                done();
            })
            .catch(console.error);
    });

});