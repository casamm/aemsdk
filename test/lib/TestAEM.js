describe('AEM', function() {

    var assert = require('assert');
    var AEM = require("../../lib/aem");
    var credentials = require('./credentials.json');
    var aem;

    before(function() {
        aem = new AEM(credentials);
    });

    describe('#constructor()', function () {
        it('should be able to construct', function () {
            assert.ok(aem);
        });
    });

    describe('#AEM.authentication', function () {
        it('AEM.authentication should be instantiated', function () {
            assert.ok(AEM.authentication);
        });
    });

    describe('#aem.authorization', function () {
        it('aem.authorization should be instantiated', function () {
            assert.ok(AEM.authorization);
        });
    });

    describe('#AEM.genId()', function () {
        it('should generate a unique id', function () {
            assert.equal(AEM.genId(4).length, 4, 'length should be 4');
            assert.equal(AEM.genId(10).length, 10, 'length should be 10');
            for(var i=0; i<100; i++) {
                assert.equal(AEM.genId(10).indexOf('g'), -1, 'no occurence of g');
                assert.equal(AEM.genId(10).indexOf('h'), -1, 'no occurence of h');
                assert.equal(AEM.genId(10).indexOf('i'), -1, 'no occurence of i');
                assert.equal(AEM.genId(10).indexOf('j'), -1, 'no occurence of j');
            }
        });
    });

    describe('#AEM.genUUID()', function () {
        it('should generate a GUID', function () {
            for(var i=0; i<100; i++) {
                assert.equal(AEM.genUUID().length, 36, 'length should be 36');
                assert.equal(AEM.genUUID().split('-').length, 5, 'should have 5 parts');
                assert.equal(AEM.genUUID().split('-')[0].length, 8, 'first part should have 8 characters');
                assert.equal(AEM.genUUID().split('-')[1].length, 4, 'second part should have 4 characters');
                assert.equal(AEM.genUUID().split('-')[2].length, 4, 'third part should have 4 characters');
                assert.equal(AEM.genUUID().split('-')[3].length, 4, 'fourth part should have 4 characters');
                assert.equal(AEM.genUUID().split('-')[4].length, 12, 'fifth part should have 12 characters');
            }
        });
    });

    after(function(){
        aem = null;
    });

});