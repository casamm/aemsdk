var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

module.exports = exports;

exports.stat = function(file) {
    return new Promise(function (resolve, reject) {
        fs.stat(file, function (error, stat) {
            error ? reject(error) : resolve(stat);
        });
    });
};

exports.readdir = function(dir) { // list of files in a directory
    return new Promise(function(resolve, reject){
        fs.readdir(dir, function(error, list) {
            error ? reject(error) : resolve(list);
        });
    });
};

exports.listdir = function (dir) { // list of files in a directory and it's subdirectories (recursive)
    var self = this;
    return this.readdir(dir)
        .then(function (list) {
            return Promise.all(list.map(function (file) {
                file = path.resolve(dir, file);
                return self.stat(file).then(function (stat) {
                    return stat.isDirectory() ? self.listdir(file) : file;
                });
            }));
        })
        .then(function (result) {
            return Array.prototype.concat.apply([], result);
        });
};

exports.md5 = function(file) {
    return new Promise(function(resolve, reject){
        var hash = crypto.createHash('md5').setEncoding('base64');
        var fd = fs.createReadStream(file).on('error', reject);
        fd.on('end', function(){hash.end(); resolve(hash.read())});
        fd.pipe(hash);
    });
};

exports.mkdir = function(dir) {
    return new Promise(function(resolve, reject){
        fs.mkdir(dir, function(error){
            error ? reject(error) : resolve(dir);
        })
    });
};

exports.rmdir = function(dir) {
    return new Promise(function(resolve, reject){
        fs.rmdir(dir, function(error){
            error ? reject(error) : resolve(dir);
        })
    });
};

exports.unlink = function(path) {
    return new Promise(function(resolve, reject){
        fs.unlink(path, function(error){
            error ? reject(error) : resolve(path);
        })
    });
};
