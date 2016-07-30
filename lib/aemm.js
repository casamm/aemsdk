const os = require('os');
const fs = require('fs');
const fsobject = require('./api/fsobject');
const path = require('path');
const crypto = require('crypto');

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
require("./http/httpobject");
require('./authorization');
require('./content/entity');
require('./product/Product');
require('./notification/notification');
require('./notification/certificate');
require('./patterns/Iterator');
require('./patterns/Observer');
require('./patterns/Queue');

AEMM.authorization = new AEMM.Authorization();
AEMM.httpObject = new AEMM.HttpObject();
AEMM.observer = new AEMM.Observer();
AEMM.publish = require('./patterns/Queue')(AEMM.Observer.prototype.addPublishObserver);
AEMM.unpublish = require('./patterns/Queue')(AEMM.Observer.prototype.addUnpublishObserver);

/*
 tunde.jarcik@sothebysrealty.com
 lois.anderson@sothebysrealty.com
 robert.whitley@sothebysrealty.com
 harry.kuper@sothebysrealty.com

 For all test accounts, password is Realogy1$

 document.getElementById('LogOnId').value =  'lois.anderson@sothebysrealty.com';
 document.getElementById('Password').value = 'Realogy1$';

 cq.mobile.user.authToken

 location.href = 'goto://ApplicationViewState/library';

 */

// var crypto = require('crypto');
// module.exports = genUuid;
//
// function genUuid(callback) {
//     if (typeof(callback) !== 'function') {
//         return uuidFromBytes(crypto.randomBytes(16));
//     }
//
//     crypto.randomBytes(16, function(err, rnd) {
//         if (err) return callback(err);
//         callback(null, uuidFromBytes(rnd));
//     });
// }
//
// function uuidFromBytes(rnd) {
//     rnd[6] = (rnd[6] & 0x0f) | 0x40;
//     rnd[8] = (rnd[8] & 0x3f) | 0x80;
//     rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
//     rnd.shift();
//     return rnd.join('-');
// }

// https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_.28random.29