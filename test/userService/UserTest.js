describe('User', function() {

    var user;
    var assert;

    before(function() {
        user = require('../../userService/User');
        assert = require('assert');
    });
    
    describe('#genId()', function () {
        it('should generate a unique id', function () {
            assert.equal(user.genId(4).length, 4, 'length should be 4');
            assert.equal(user.genId(10).length, 10, 'length should be 10');
            for(var i=0; i<100; i++) {
                assert.equal(user.genId(10).indexOf('g'), -1, 'no occurence of g');
                assert.equal(user.genId(10).indexOf('h'), -1, 'no occurence of h');
                assert.equal(user.genId(10).indexOf('i'), -1, 'no occurence of i');
                assert.equal(user.genId(10).indexOf('j'), -1, 'no occurence of j');
            }
        });
    });

    describe('#genUUID()', function () {
        it('should generate a GUID', function () {
            for(var i=0; i<100; i++) {
                assert.equal(user.genUUID().length, 36, 'length should be 36');
                assert.equal(user.genUUID().split('-').length, 5, 'should have 5 parts');
                assert.equal(user.genUUID().split('-')[0].length, 8, 'first part should have 8 characters');
                assert.equal(user.genUUID().split('-')[1].length, 4, 'second part should have 4 characters');
                assert.equal(user.genUUID().split('-')[2].length, 4, 'third part should have 4 characters');
                assert.equal(user.genUUID().split('-')[3].length, 4, 'fourth part should have 4 characters');
                assert.equal(user.genUUID().split('-')[4].length, 12, 'fifth part should have 12 characters');
            }
        });
    });

    after(function(){
        user = null;
        assert = null;
    });

});