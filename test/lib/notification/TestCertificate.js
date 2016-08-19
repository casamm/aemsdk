var assert = require('assert');
var AEMM = require('../../../lib/aemm');
var certificate = new AEMM.Certificate();
var tenantId = '192a7f47-84c1-445e-a615-ff82d92e2eaa';

before(function(done){
    AEMM.authentication.requestToken()
        .then(function(){done()})
        .catch(console.error);
});

var body = {
    schema: {entityType: AEMM.Entity.TYPE, tenantId: tenantId}
};

it('should be instantiated', function () {
    assert.ok(certificate, 'constructor test');
});

it('should requestList', function(done){
    certificate.requestList(body)
        .then(function(result){
            done();
        }).catch(console.error);
});

it('should check for revoked certificate', function(done){
    var data = {schema: {os: 'ios', appId: 'com.mirumagency.aemmsdk', tenantId: tenantId}};
    certificate.isRevoked(data)
        .then(function(result){
            done();
        }).catch(console.error);
});