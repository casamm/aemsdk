var AEM = (function(){

    function AEM(options) {
        if(options) {
            AEM.config.credentials.clientId = options.clientId || null;
            AEM.config.credentials.clientSecret = options.clientSecret || null;
            AEM.config.credentials.clientVersion = options.clientVersion || null;
            AEM.config.credentials.deviceId = options.deviceId || null;
            AEM.config.credentials.deviceToken = options.deviceToken || null;
        }
    }

    /**
     * Configuration
     * @type {{credentials: {clientId: null, clientSecret: null, clientVersion: null, deviceId: null, deviceToken: null}}}
     */
    AEM.config = {
        credentials : {
            clientId: null,
            clientSecret: null,
            clientVersion: null,
            deviceId: null,
            deviceToken: null
        }
    };

    /**
     *
     * @type {AEM.Authentication}
     */
    AEM.authentication = null;

    /**
     * Helper.
     * Generate an alphanumeric (a-f) value of a given length.
     * Used to generate each section of the client-side UUID.
     * @param length The length of the alphanumeric value
     * @returns {string} The alphanumeric value of the given length
     */
    AEM.genId = function(length) {
        for(var i=0, id=''; i<length; i++) {
            if(Math.round(Math.random())) { // generate a random letter, 0 or 1
                id += String.fromCharCode(Math.floor((Math.random() * 5) + 1) + 97);
            } else {
                id += Math.floor((Math.random() * 5) + 1);
            }
        }
        return id;
    };

    /**
     * Helper
     * Generate the UUID (alphanumeric).
     * @returns {string} The UUID of the following length: 8-4-4-4-12
     */
    AEM.genUUID = function() {
        var low = this.genId(8);
        var mid = this.genId(4);
        var high = this.genId(4);
        var seq = this.genId(4);
        var node = this.genId(12);
        var uuid = low + "-" + mid + "-" + high + "-" + seq + "-" + node;
        return uuid;
    };

    return AEM;
})();

module.exports = AEM;

require("./http/remote");
require('./authentication');
require('./authorization');
require('./content/entity');

AEM.authentication = new AEM.Authentication();
AEM.authorization = new AEM.Authorization();