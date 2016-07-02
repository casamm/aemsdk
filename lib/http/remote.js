var AEM = require("../aem");

var Remote = (function(){

    const https = require('https');
    const authentication = new AEM.Authentication();

    /**
     * Remote constructor
     * @constructor
     */
    function Remote() {}

    /**
     * Get authentication token, generate headers for an http request
     * @param body
     * @returns {Promise}
     */
    Remote.prototype.request = function(body) {
        return authentication.getToken(body)
            .then(this.generateHeaders)
            .then(this.useProxy)
            .then(this.execute);
    };

    /**
     * Generate request header elements.
     * @param body
     * @returns {*}
     */
    Remote.prototype.generateHeaders = function(body) {
        body.requestId = AEM.genUUID();
        body.sessionId = body.sessionId || AEM.genUUID();
        body.options.headers = body.options.headers || {};

        body.options.headers['accept'] = body.options.headers['accept'] || 'application/json';
        body.options.headers['content-type'] = body.options.headers['content-type'] || 'application/json';
        body.options.headers['x-dps-client-request-id'] = body.requestId;
        body.options.headers['x-dps-client-session-id'] = body.sessionId;
        body.options.headers['x-dps-api-key'] = AEM.config.credentials.clientId;
        body.options.headers['x-dps-client-version'] = AEM.config.credentials.clientVersion;
        body.options.headers['Authorization'] = body.authentication.token_type + ' ' + body.authentication.access_token;

        if(body.image) {
            body.uploadId = body.uploadId || AEM.genUUID(); //for upload and seal operation
            body.options.headers['x-dps-upload-id'] = body.uploadId; //for upload and seal
            if(body.image.sizes) {body.options.headers['x-dps-image-sizes'] = body.image.sizes} //for upload
        }

        return body;
    };

    /**
     * Execute a server http request
     * @param body
     * @returns {Promise}
     */
    Remote.prototype.execute = function(body) {
        return new Promise(function(resolve, reject){
            var request = https.request(body.options, function(response) {
                var buffers = [];
                response.on('data', function(chunk) {buffers.push(chunk)});
                response.on('end', function(){
                    var data = buffers.length ? Buffer.concat(buffers).toString() : null;
                    if(response.headers['content-type'].match(/application\/json/)) {
                        data = JSON.parse(data ? data : '""');
                    }
                    response.statusCode >= 200 && response.statusCode < 300 ? resolve(data) : reject(data);
                });
            }).on('error', reject);

            //end if regular request, for image alternate way
            if(body.options.headers['content-type'].match(/application\/json/)) {
                request.end(JSON.stringify(body.entity || '""'));
            } else if(body.image.path) {
                const fs = require('fs');
                var readStream = fs.ReadStream(body.image.path);
                readStream.on('error', reject);
                readStream.on('close', function(){request.end()});
                readStream.pipe(request);
            }
        });
    };

    Remote.prototype.useProxy = function(body) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //Charles Reverse Proxy
        switch(body.options.hostname) {
            case AEM.config.endPoints.authorization:
                body.options.port = "60102";
                break;
            case AEM.config.endPoints.ingestion:
                body.options.port = "60103";
                break;
            case AEM.config.endPoints.notification:
                body.options.port = "60104";
                break;
            case AEM.config.endPoints.producer:
                body.options.port = "60105";
                break;
            case AEM.config.endPoints.product:
                body.options.port = "60106";
                break;
        }
        body.options.hostname = "localhost";

        return body;
    };

    return Remote;

}());

AEM.Remote = Remote;