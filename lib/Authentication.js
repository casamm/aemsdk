var AEM = require("./aem");

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
            hostname: AEM.config.endPoints.authentication,
            port: 443,
            path: '/ims/token/v1?grant_type=device&scope=AdobeID,openid' +
            '&client_id=' + AEM.config.credentials.clientId +
            '&client_secret=' + AEM.config.credentials.clientSecret +
            '&device_id=' + AEM.config.credentials.deviceId +
            '&device_token=' + AEM.config.credentials.deviceToken,
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

/**
 * Return cached token if available otherwise request a new one
 * @param body
 * @returns {*}
 */
Authentication.prototype.getToken = function(body) {
    if(expiry && new Date().getTime() < expiry) {
        body.authentication = data;
        return Promise.resolve(body);
    } else {
        return this.requestToken(body);
    }
};

AEM.Authentication = Authentication;