/**
 * AEM constructor
 * @constructor
 */
function AEM() {}

/**
 * Configuration
 * @type {{credentials: {clientId: null, clientSecret: null, clientVersion: null, deviceId: null, deviceToken: null}, endPoints}}
 */
AEM.config = {
    credentials : {
        clientId: process.env.AEMM_CLIENT_ID || null,
        clientSecret: process.env.AEMM_CLIENT_SECRET || null,
        clientVersion: process.env.AEMM_CLIENT_VERSION || "1.0.0",
        deviceId: process.env.AEMM_DEVICE_ID || null,
        deviceToken: process.env.AEMM_DEVICE_TOKEN || null
    },
    endPoints: require('./configuration/end-points.json'),
    mimeTypes: require('./configuration/mime-types.json')
};

/**
 * Helper
 * Generate the UUID (alphanumeric).
 * @returns {string} The UUID of the following length: 8-4-4-4-12
 */
AEM.genUUID = function() {
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


module.exports = AEM;

require('./authentication');
require("./http/remote");
require('./authorization');
require('./content/entity');
require('./product/Product');

AEM.authorization = new AEM.Authorization();
AEM.remote = new AEM.Remote();