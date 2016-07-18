describe('AEMM', function() {

    var assert = require('assert');
    var AEM = require("../../lib/aemm");
    
    describe('AEMM', function () {
        it('should be available for use', function () {
            assert.ok(AEMM.credentials.clientId);
            assert.ok(AEMM.credentials.clientSecret);
            assert.ok(AEMM.credentials.clientVersion);
            assert.ok(AEMM.credentials.deviceId);
            assert.ok(AEMM.credentials.deviceToken);
        });
    });

    describe('#AEMM.genUUID()', function () {
        it('should generate a GUID', function () {
            for(var i=0; i<100; i++) {
                assert.equal(AEMM.genUUID().length, 36, 'length should be 36');
                assert.equal(AEMM.genUUID().split('-').length, 5, 'should have 5 parts');
                assert.equal(AEMM.genUUID().split('-')[0].length, 8, 'first part should have 8 characters');
                assert.equal(AEMM.genUUID().split('-')[1].length, 4, 'second part should have 4 characters');
                assert.equal(AEMM.genUUID().split('-')[2].length, 4, 'third part should have 4 characters');
                assert.equal(AEMM.genUUID().split('-')[3].length, 4, 'fourth part should have 4 characters');
                assert.equal(AEMM.genUUID().split('-')[4].length, 12, 'fifth part should have 12 characters');
            }
        });
    });

});