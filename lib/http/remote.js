var AEM = require("../aem");

var Remote = (function(){

    const https = require('https');
    const os = require('os');
    const fs = require('fs');
    const path = require('path');
    const authentication = new AEM.Authentication();

    /**
     * Remote constructor
     * @constructor
     */
    function Remote() {}

    /**
     * Execute a server http request
     * @param body
     * @returns {Promise}
     */
    Remote.prototype.execute = function(body) {
        return new Promise(function(resolve, reject){
            var request = https.request(body.options, function(response) {

                delete body.authentication; // cleanup
                delete body.options;

                if(response.headers['content-type'].match(/application\/json/)) { // json response
                    var buffers = [];
                    response.on('data', function(chunk) {buffers.push(chunk)});
                    response.on('end', function(){
                        var data = JSON.parse(buffers.length ? Buffer.concat(buffers).toString() : '""');
                        response.statusCode >= 200 && response.statusCode < 300 ? resolve(data) : reject(data);
                    });
                } else if(response.headers['content-type'].match(/image\//)) { // image response

                    var file = body.image.type + "." + response.headers['content-type'].split("/")[1];
                    var directory = path.join(os.tmpDir(), "com.adobe.aemmobile", body.data.publicationId, body.data.entityName);
                    var url = path.join(directory, file);

                    var segments = directory.split(path.sep); // create directories/subdirectories
                    for(var i=1; i<segments.length; i++) {
                        var segment = segments.slice(0, i+1).join(path.sep);
                        !fs.existsSync(segment) ? fs.mkdirSync(segment) : null;
                    }

                    var writeStream = fs.createWriteStream(url);
                    response.pipe(writeStream);
                    writeStream.on('error', reject);
                    response.on('end', function(){writeStream.end()});
                    writeStream.on('finish', function(){
                        body.image.path = url;
                        resolve(body);
                    });
                }

            }).on('error', reject);

            if(body.options.headers['content-type'].match(/application\/json/)) { // json request
                request.end(JSON.stringify(body.data || '""'));
            } else if(body.image.path) { // image request
                var readStream = fs.ReadStream(body.image.path);
                readStream.on('error', reject);
                readStream.on('close', function(){request.end()});
                readStream.pipe(request);
            }
        });
    };

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

        body.options.headers['accept'] = body.options.headers['accept'] || 'application/json;charset=UTF-8';
        body.options.headers['content-type'] = body.options.headers['content-type'] || 'application/json;charset=UTF-8';
        body.options.headers['x-dps-client-request-id'] = body.requestId;
        body.options.headers['x-dps-client-session-id'] = body.sessionId;
        body.options.headers['x-dps-api-key'] = AEM.config.credentials.clientId;
        body.options.headers['x-dps-client-version'] = AEM.config.credentials.clientVersion;
        body.options.headers['Authorization'] = body.authentication.token_type + ' ' + body.authentication.access_token;

        if(body.image && body.image.path) { //download request doesn't have path
            body.uploadId = body.uploadId || AEM.genUUID(); //for upload and seal operation -
            body.options.headers['x-dps-upload-id'] = body.uploadId; //for upload and seal
            if(body.image.sizes) {body.options.headers['x-dps-image-sizes'] = body.image.sizes}
        }

        return body;
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