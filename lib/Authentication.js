var AEM = require("./aem");

var Authentication = (function(){

    var _data = null;
    var _authentication_expiry = null;
    
    /**
     * Authentication class constructor
     * @constructor
     */
    function Authentication() {
    }

    /**
     * Request the access token.
     * @param credentials
     * @returns {Promise}
     */
    Authentication.prototype.requestToken = function() {
        return new Promise(function(resolve, reject){
            var options = {
                hostname: require('./configuration/end-points.json').authentication,
                port: 443,
                path: '/ims/token/v1' +
                '?grant_type=device' +
                '&client_id=' + AEM.config.credentials.clientId +
                '&client_secret=' + AEM.config.credentials.clientSecret +
                '&scope=AdobeID,openid' +
                '&device_id=' + AEM.config.credentials.deviceId +
                '&device_token=' + AEM.config.credentials.deviceToken,
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            const https = require('https');
            https.request(options, function(response) {
                var body = [];
                response.on('data', function(chunk) {
                    body.push(chunk);
                });
                response.on('end', function(){
                    if(response.statusCode == 200) {
                        _data = JSON.parse(Buffer.concat(body).toString());
                        _authentication_expiry = new Date(new Date().getTime() + _data.expires_in).getTime();
                        resolve(_data);
                    } else {
                        reject(JSON.parse(Buffer.concat(body).toString()))
                    }
                });
            }).on('error', function(error) {
                reject(error);
            }).end();
        });
    };

    Authentication.prototype.getToken = function() {
        var self = this;
        return new Promise(function(resolve, reject){
            if(_authentication_expiry && new Date().getTime() < _authentication_expiry) {
                resolve(_data);
            } else {
                self.requestToken().then(function(data){
                    resolve(data);
                }, function(error){
                    reject(error);
                })
            }
        });
    };

    return Authentication;
    
})();

AEM.Authentication = Authentication;

//http://stackoverflow.com/questions/26739167/jwt-json-web-token-automatic-prolongation-of-expiration