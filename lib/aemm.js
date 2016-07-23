const os = require('os');
const fs = require('fs');
const path = require('path');
var crypto = require('crypto');

/**
 * AEM constructor
 * @constructor
 */
function AEMM() {}

/**
 * Credentials
 * @type {{clientId: (*|null), clientSecret: (*|null), clientVersion: (*|string), deviceId: (*|null), deviceToken: (*|null)}}
 */
AEMM.credentials = {
    clientId: process.env.AEMM_CLIENT_ID || null,
    clientSecret: process.env.AEMM_CLIENT_SECRET || null,
    clientVersion: process.env.AEMM_CLIENT_VERSION || "1.0.0",
    deviceId: process.env.AEMM_DEVICE_ID || null,
    deviceToken: process.env.AEMM_DEVICE_TOKEN || null
};

AEMM.endPoints = require('./configuration/end-points.json');

AEMM.mimetypes = require('./configuration/mime-types.json');

/**
 * Helper
 * Generate the UUID (alphanumeric).
 * @returns {string} The UUID of the following length: 8-4-4-4-12
 */
AEMM.genUUID = function() {
    var low = genId(8);
    var mid = genId(4);
    var high = genId(4);
    var seq = genId(4);
    var node = genId(12);
    var uuid = low + "-" + mid + "-" + high + "-" + seq + "-" + node;
    return uuid;
};

/**
 * Helper.
 * Generate an alphanumeric (a-f) value of a given length.
 * Used to generate each section of the client-side UUID.
 * @param length The length of the alphanumeric value
 * @returns {string} The alphanumeric value of the given length
 */
var genId = function(length) {
    for(var i=0, id=''; i<length; i++) {
        if(Math.round(Math.random())) { // generate a random letter, 0 or 1
            id += String.fromCharCode(Math.floor((Math.random() * 5) + 1) + 97);
        } else {
            id += Math.floor((Math.random() * 5) + 1);
        }
    }
    return id;
};

AEMM.tmpDir = function(dir) { // create temp directories/subdirectories
    var tmp = path.join(os.tmpDir(), "com.adobe.aemmobile", dir);
    var segments = tmp.split(path.sep);
    for(var i=os.tmpDir().split(path.sep).length; i<segments.length; i++) {
        var segment = segments.slice(0, i+1).join(path.sep);
        if(!fs.existsSync(segment)) fs.mkdirSync(segment);
    }
    return tmp;
};

AEMM.listdir = function(dir) { // list of files in a directory and it's subdirectories (recursive)
    return readdir(dir)
        .then(function(list){
            return Promise.all(list.map(function(file){
                file = path.resolve(dir, file);
                return AEMM.stat(file).then(function(stat){return stat.isDirectory() ? AEMM.listdir(file) : file});
            }));
        })
        .then(function(result){
            return Array.prototype.concat.apply([], result);
        });
};

function readdir(dir) { // list of files in a directory
    return new Promise(function(resolve, reject){
        fs.readdir(dir, function(error, list) {error ? reject(error) : resolve(list)});
    });
}

AEMM.stat = function(file) {
    return new Promise(function(resolve, reject){
        fs.stat(file, function(error, stat) {error ? reject(error) : resolve(stat)});
    });
};

AEMM.md5 = function(file) {
    return new Promise(function(resolve, reject){
        var hash = crypto.createHash('md5').setEncoding('base64');
        var fd = fs.createReadStream(file).on('error', reject);
        fd.on('end', function(){hash.end(); resolve(hash.read())});
        fd.pipe(hash);
    });
};

AEMM.matchUrl = function(href) {
    return href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication|sharedContent]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
};

AEMM.matchContentUrl = function(href) {
    return href.match(/(([a-f0-9]+\-)+[a-f0-9]+)\/(.*?)\/(.*?)\/contents;contentVersion=\d*\//);
};

AEMM.matchContentUrlPath = function(href) { // contentUrl with path
    return href.match(/(([a-f0-9]+\-)+[a-f0-9]+)\/(.*?)\/(.*?)\/contents;contentVersion=\d*\/(.*)\/(.*)/);
};

module.exports = AEMM;

require('./authentication');
require("./http/httpObject");
require('./authorization');
require('./content/entity');
require('./product/Product');

AEMM.authorization = new AEMM.Authorization();
AEMM.httpObject = new AEMM.HttpObject();