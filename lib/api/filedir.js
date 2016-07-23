var fs = require('fs');

var listdir = function (dir) { // list of files in a directory and it's subdirectories (recursive)
    return readdir(dir)
        .then(function (list) {
            return Promise.all(list.map(function (file) {
                file = path.resolve(dir, file);
                return stat(file).then(function (stat) {
                    return stat.isDirectory() ? listdir(file) : file;
                });
            }));
        })
        .then(function (result) {
            return Array.prototype.concat.apply([], result);
        });
};

var readdir = function(dir) { // list of files in a directory
    return new Promise(function(resolve, reject){
        fs.readdir(dir, function(error, list) {
            error ? reject(error) : resolve(list);
        });
    });
};

var stat = function(file) {
    return new Promise(function (resolve, reject) {
        fs.stat(file, function (error, stat) {
            error ? reject(error) : resolve(stat);
        });
    });
};

var md5 = function(file) {
    return new Promise(function(resolve, reject){
        var hash = crypto.createHash('md5').setEncoding('base64');
        var fd = fs.createReadStream(file).on('error', reject);
        fd.on('end', function(){hash.end(); resolve(hash.read())});
        fd.pipe(hash);
    });
};

var tmpDir = function(dir) { // create temp directories/subdirectories
    return new Promise(function(resolve, reject){
        var tmp = path.join(os.tmpDir(), "com.adobe.aemmobile", dir);
        var segments = tmp.split(path.sep);
        for(var i=os.tmpDir().split(path.sep).length; i<segments.length; i++) {
            var segment = segments.slice(0, i+1).join(path.sep);
            if(!fs.existsSync(segment))
                fs.mkdirSync(segment);
        }
        return tmp;
    })
};

var exists = function(file) {
    return new Promise(function(resolve, reject){
        fs.exists(file, function(error){
            error ? reject(error) : resolve();
        })
    });
};

var mkdir = function(path) {
    return new Promise(function(resolve, reject){
        fs.mkdir(path, function(error){
            error ? reject(error) : resolve();
        })
    });
};

modules.exports = {
    listdir: listdir,
    readdir: readdir,
    stat: stat,
    md5: md5
};

fs.exists('/etc/passwd1', (exists) => {
    console.log(exists ? 'it\'s there' : 'no passwd!');
});
