var AEM = require("../aem");

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
 * Get authentication token, generate headers for an http request
 * @param body
 * @returns {Promise}
 */
Remote.prototype.request = function(body) {
    return authentication.getToken(body)
        .then(this.generateHeaders)
        .then(this.useProxy)
        .then(this.execute)
};

/**
 * Execute a server http request
 * @param body
 * @returns {Promise}
 */
Remote.prototype.execute = function(body) {
    return new Promise(function(resolve, reject){

        var request = https.request(body.options, function(response) { // response
            switch (response.headers['content-type']) {
                case AEM.config.mimeTypes.json:
                case "application/json":
                    var buffers = [];
                    response.on('data', function(chunk) {buffers.push(chunk)});
                    response.on('end', function(){
                        var data = JSON.parse(buffers.length ? Buffer.concat(buffers).toString() : '""');
                        response.statusCode >= 200 && response.statusCode < 300 ? resolve(data) : reject(data);
                    });
                    break;
                case AEM.config.mimeTypes.jpeg:
                case AEM.config.mimeTypes.png:
                    var file = body.href.split("/")[1] + "." + response.headers['content-type'].split("/")[1];
                    var directory = path.join(os.tmpDir(), "com.adobe.aemmobile", body.schema.publicationId, body.schema.entityName);
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
                        body.file = {path: url};
                        resolve(body);
                    });
                    break;
                case AEM.config.mimeTypes.octetstream: // delete
                case AEM.config.mimeTypes.html:
                default:
                    var data = '';
                    response.on('data', function(chunk) {data += chunk});
                    response.on('end', function(){
                        response.statusCode >= 200 && response.statusCode < 300 ? resolve(data) : reject(data);
                    });
            }

            delete body.options;
            delete body.authentication;

        }).on('error', reject);

        switch(body.options.headers['content-type']) { //request
            case AEM.config.mimeTypes.json:
                request.end(JSON.stringify(body.schema));
                break;
            case AEM.config.mimeTypes.urlencoded:
                request.end();
                break;
            case AEM.config.mimeTypes.jpeg:
            case AEM.config.mimeTypes.png:
            case AEM.config.mimeTypes.octetstream:
            case AEM.config.mimeTypes.article:
                var readStream = fs.ReadStream(body.file.path);
                readStream.on('error', reject);
                readStream.on('close', function(){request.end()});
                readStream.pipe(request);
                break;
            default:
                console.log("unknown mimetype");
        }
    });
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

    body.options.headers['accept'] = body.options.headers['accept'] || AEM.config.mimeTypes.json;
    body.options.headers['content-type'] = body.options.headers['content-type'] || AEM.config.mimeTypes.json;
    body.options.headers['x-dps-client-request-id'] = body.requestId;
    body.options.headers['x-dps-client-session-id'] = body.sessionId;
    body.options.headers['x-dps-api-key'] = AEM.config.credentials.clientId;
    body.options.headers['x-dps-client-version'] = AEM.config.credentials.clientVersion;
    body.options.headers['Authorization'] = body.authentication.token_type + ' ' + body.authentication.access_token;

    if(body.file && body.file.path) { 
        body.uploadId = body.uploadId || AEM.genUUID(); //for upload and seal operation -
        body.options.headers['x-dps-upload-id'] = body.uploadId; //for upload and seal
        if(body.file.sizes) {body.options.headers['x-dps-image-sizes'] = body.file.sizes}
    }

    return body;
};

Remote.prototype.useProxy = function(body) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    switch(body.options.hostname) {
        case AEM.config.endPoints.authentication:
            body.options.port = "60101";
            break;
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

AEM.Remote = Remote;