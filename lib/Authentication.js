var AEMM = require("./aemm");

var data;
var expiry;

/**
 * Authentication class constructor
 * @constructor
 */
function Authentication() {}

/**
 * Request the access token.
 * @param credentials
 * @returns {Promise}
 */
Authentication.prototype.requestToken = function(body) {
    return new Promise(function(resolve, reject){
        var options = {
            hostname: AEMM.endPoints.authentication,
            path: '/ims/token/v1?grant_type=device&scope=AdobeID,openid' +
            '&client_id=' + AEMM.credentials.clientId +
            '&client_secret=' + AEMM.credentials.clientSecret +
            '&device_id=' + AEMM.credentials.deviceId +
            '&device_token=' + AEMM.credentials.deviceToken,
            method: 'POST',
            headers: {
                'accept': 'application/json;charset=UTF-8',
                'content-type': 'application/x-www-form-urlencoded'
            }
        };

        const https = require('https');
        var request = https.request(options, function(response) {
            var buffers = [];
            response.on('data', function(chunk) {buffers.push(chunk)});
            response.on('end', function(){
                data = buffers.length ? Buffer.concat(buffers).toString() : null;
                if(response.headers['content-type'].match(/application\/json/)) {
                    body.authentication = data = JSON.parse(data ? data : '""');
                    expiry = new Date(new Date().getTime() + data.expires_in).getTime();
                }
                response.statusCode == 200 ? resolve(body) : reject(data);
            });
        }).on('error', reject);

        request.end();
    });
};

Authentication.prototype.generateHeaders = function(body) {
    body.requestId = AEMM.genUUID();
    body.sessionId = body.sessionId || AEMM.genUUID();
    body.options.headers = body.options.headers || {};

    body.options.headers['accept'] = body.options.headers['accept'] || AEMM.mimetypes.json;
    body.options.headers['content-type'] = body.options.headers['content-type'] || AEMM.mimetypes.json;
    body.options.headers['x-dps-client-request-id'] = body.requestId;
    body.options.headers['x-dps-client-session-id'] = body.sessionId;
    body.options.headers['x-dps-api-key'] = AEMM.credentials.clientId;
    body.options.headers['x-dps-client-version'] = AEMM.credentials.clientVersion;
    body.options.headers['Authorization'] = data.token_type + ' ' + data.access_token;

    return body;
};

/**
 * Return cached token if available otherwise request a new one
 * @param body
 * @returns {*}
 */
Authentication.prototype.getToken = function(body) {
    if(expiry && new Date().getTime() < expiry) {
        body.authentication = data;
        return Promise.resolve(body).then(this.generateHeaders);
    } else {
        return this.requestToken(body).then(this.generateHeaders);
    }
};

AEMM.Authentication = Authentication;