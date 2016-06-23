describe('Authentication', function() {

    var assert = require('assert');
    var AEM = require("../../lib/aem");
    var credentials = require('./credentials.json');
    var aem;

    before(function() {
        aem = new AEM(credentials);
    });

    describe('#requestToken()', function () {
        it('should return a token', function (done) {
            AEM.authentication.requestToken().then(function(data){
                assert.ok(data);
                assert.ok(data.access_token);
                done();
            }, function(error){
                console.log(error);
            });
        });
    });

    describe('#getToken()', function () {
        it('should return a token by using requestToken', function (done) {
            AEM.authentication.getToken().then(function(data){
                assert.ok(data);
                assert.ok(data.access_token);
                done();
            }, function(error){
                console.log(error);
            });
        });
    });

    describe('#cached requestToken()', function () {
        it('should return a cached token', function (done) {

            AEM.authentication.getToken().then(function(data){
                var access_token = data.access_token;

                AEM.authentication.getToken().then(function(data){
                    assert.ok(access_token == data.access_token);
                    done();
                }, function(error){
                    console.log('a', error);
                });

            }, function(error){
                console.log(error);
            });
        });
    });

    describe('#badToken', function () {
        it('should return invalid auth', function (done) {
            var AEM2 = new AEM({
                clientId: "aemm-ext-par-mirumagency-entitlement",
                clientSecret: "a72a9c19-f4a0-40d0-9090-2f68d58b35bb",
                clientVersion: "1.0.0",
                deviceId: "xyz",
                deviceToken: "abc"
            });
            AEM.authentication.requestToken().then(function(data){
                //success is error
            }, function(error){
                assert.ok(error);
                assert.ok(error.error);
                done();
            });
        });
    });

    after(function(){
        aem = null;
    });

});