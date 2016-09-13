var AEMM = require("./aemm");
const https = require('https');

var data;
var expiry;

/**
 * Authentication class constructor
 * @constructor
 */
function Authentication() {
}

/**
 * Request the access token.
 * @param data
 * @returns {Promise}
 */
Authentication.prototype.requestToken = function() {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'POST',
            hostname: 'ims-na1.adobelogin.com',
            path: '/ims/token/v1?grant_type=device&scope=AdobeID,openid' +
                '&client_id=' + AEMM.credentials.clientId +
                '&client_secret=' + AEMM.credentials.clientSecret +
                '&device_id=' + AEMM.credentials.deviceId +
                '&device_token=' + AEMM.credentials.deviceToken,
            headers: {
                'accept': 'application/json;charset=UTF-8',
                'content-type': 'application/x-www-form-urlencoded'
            }
        }, function(response) {
            var buffers = [];
            response.on('data', function(chunk) {buffers.push(chunk)});
            response.on('end', function(){
                data = JSON.parse(Buffer.concat(buffers).toString());
                expiry = new Date(new Date().getTime() + data.expires_in).getTime();
                response.statusCode == 200 ? resolve(data) : reject(data);
            });
        }).on('error', reject);
        request.end();
    });
};

/**
 * Returns cached token
 * @returns {*}
 */
Authentication.prototype.getToken = function() {
    if(!data) throw Error("Token has not been retrieved yet or Invalid Credentials");
    return data;
};

AEMM.Authentication = Authentication;