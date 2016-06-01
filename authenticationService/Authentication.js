/**
 * Authentication class constructor
 * @constructor
 */
var Authentication = function(credentials) {
    this.credentials = credentials;
};

/**
 * Get the access token.
 * @param credentials
 * @returns {Promise}
 */
Authentication.prototype.requestToken = function() {

    var self = this;

    return new Promise(function(resolve, reject){

        const https = require('https');

        var path = '/ims/token/v1';
        path += '?grant_type=device';
        path += '&client_id=' + encodeURI(self.credentials.clientId);
        path += '&client_secret=' + encodeURI(self.credentials.clientSecret);
        path += '&scope=' + encodeURI('AdobeID,openid');
        path += '&device_id=' + self.credentials.deviceId;
        path += '&device_token=' + self.credentials.deviceToken;

        var options = {
            hostname: require('../configuration/end-points.json').collection,
            port: 443,
            path: path,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        var request = https.request(options, function(response) {
            var data = "";
            response.on('data', function(d) {
                data += d;
             });
            response.on('end', function(){
                resolve(JSON.parse(data));
            });
        });

        request.on('error', function(error) {
            reject(error);
        });

        request.end();
    });
};

/**
 * Credentials
 * @type {json}
 */
Authentication.prototype.credentials = null;

module.exports = Authentication;