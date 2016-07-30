var fs = require('../../../lib/api/fsobject');
var path = require('path');
var assert = require('assert');

describe("fs tests", function() {

    it('should retruns stat', function(done){
        fs.stat(__filename)
            .then(function(stat){
                assert.ok(stat.dev);
                assert.ok(stat.mode);
                done()
            }).catch(console.error);
    });

    it('should reject', function(done){
        fs.stat("abc")
            .then(function(stat){})
            .catch(function(){
                done();
            });
    });

    it('should readdir', function(done){
        fs.readdir(path.join(__dirname, '../'))
            .then(function(list){
                assert.ok(list.length);
                done();
            }).catch(console.error);
    });

    it('should create hash', function(done){
        fs.md5(__filename)
            .then(function(data){
                assert.ok(data);
                done();
            }).catch(console.error)
    });

    it('should check for existence', function(done){
        fs.stat(__dirname)
            .then(function(data){
                console.log(data);
                done();
            }).catch(console.error);
    });

    it('should create and delete directory', function(done){
        fs.mkdir(path.join(__dirname, "temp"))
            .then(fs.rmdir)
            .then(function(){done()})
            .catch(console.error);
    });

    it('should throw error while deleting non existing file', function(done){
        fs.unlink(path.join(__dirname, "temp.js"))
            .catch(function(){done()})
    });

    it('should listdir', function(done){
        fs.listdir(path.join(__dirname, "../"))
            .then(function(result){
                console.log(result);
            })
            .catch(console.error);
    });

});