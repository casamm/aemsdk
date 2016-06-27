var AEM = require("../aem");

var Remote = (function(){

    /**
     * Remote constructor
     * @constructor
     */
    function Remote() {
    }

    /**
     * Make a server http request
     * @param options
     * @param body
     * @returns {Promise}
     */
    Remote.prototype.request = function(options, body) {
        options = options || {};
        options.headers = options.headers || {};
        body = body || '';

        return new Promise(function(resolve, reject){
            AEM.authentication.getToken().then(function(authentication){

                options.headers['x-dps-api-Key'] = AEM.config.credentials.clientId;
                options.headers['x-dps-client-version'] = AEM.config.credentials.clientVersion;
                options.headers['Authorization'] = authentication.token_type + ' ' + authentication.access_token;

                const https = require('https');

                options.hostname = "localhost";
                options.port = "60105";
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

                var response = https.request(options, function(response) {
                    var buffers = [];
                    response.on('data', function(chunk) {
                        buffers.push(chunk);
                    });
                    response.on('end', function(){
                        var body = buffers.length ? Buffer.concat(buffers).toString() : null;
                        if(response.headers['content-type'].match(/application\/json/)) {
                            body = JSON.parse(body ? body : '""');
                        }
                        response.statusCode >= 200 && response.statusCode < 300 ? resolve(body) : reject(body);
                    });
                }).on('error', function(error) {
                    reject(error);
                }).end(body);

            }, function(error) {
                reject(error);
            });
        });
    };

    /**
     * Upload file to a remote server
     * @param options
     * @param path
     * @returns {Promise}
     */
    Remote.prototype.upload = function(options, body) {
        options = options || {};
        options.headers = options.headers || {};

        return new Promise(function(resolve, reject){
            AEM.authentication.getToken().then(function(authentication){

                options.headers['x-dps-api-Key'] = AEM.config.credentials.clientId;
                options.headers['x-dps-client-version'] = AEM.config.credentials.clientVersion;
                options.headers['Authorization'] = authentication.token_type + ' ' + authentication.access_token;

                const https = require('https');
                var request = https.request(options, function(response) {
                    var buffers = [];
                    response.on('data', function(chunk) {
                        buffers.push(chunk);
                    });
                    response.on('end', function(){
                        var body = buffers.length ? Buffer.concat(buffers).toString() : null;
                        if(response.headers['content-type'].match(/application\/json/)) {
                            body = JSON.parse(body ? body : '""');
                        }
                        response.statusCode >= 200 && response.statusCode < 300 ? resolve(body) : reject(body);
                    });
                }).on('error', function(error) {
                    reject(error);
                });

                const fs = require('fs');
                var readStream = fs.ReadStream(body.imagePath);
                readStream.on('error', function(error){
                    reject(error);
                });
                readStream.on('close', function(){
                    request.end();
                });
                readStream.pipe(request);
            }, function(error) {
                reject(error);
            });
        });
    };

    return Remote;

})();

AEM.Remote = Remote;