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
                case AEM.mimetypes.json:
                case "application/json;charset=UTF-8":
                    var buffers = [];
                    response.on('data', function(chunk) {buffers.push(chunk)});
                    response.on('end', function(){
                        var data = JSON.parse(buffers.length ? Buffer.concat(buffers).toString() : '""');
                        response.statusCode >= 200 && response.statusCode < 300 ? resolve(data) : reject(data);
                    });
                    break;
                case AEM.mimetypes.jpeg:
                case AEM.mimetypes.png:
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
                case AEM.mimetypes.octetstream: // delete
                case AEM.mimetypes.html:
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

        var readStream;
        switch(body.options.headers['content-type']) { //request
            case AEM.mimetypes.json:
                request.end(JSON.stringify(body.schema));
                break;
            case AEM.mimetypes.urlencoded:
                request.end();
                break;
            case AEM.mimetypes.jpeg:
            case AEM.mimetypes.png:
                readStream = fs.ReadStream(body.image.path);
                break;
            case AEM.mimetypes.octetstream:
                readStream = fs.ReadStream(body.font.path);
                break;
            case AEM.mimetypes.article:
                readStream = fs.ReadStream(body.article.path);
                break;
            default:
                console.log("unknown mimetype");
        }
        if(readStream) {
            readStream.on('error', reject);
            readStream.on('close', function(){request.end()});
            readStream.pipe(request);
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

    body.options.headers['accept'] = body.options.headers['accept'] || AEM.mimetypes.json;
    body.options.headers['content-type'] = body.options.headers['content-type'] || AEM.mimetypes.json;
    body.options.headers['x-dps-client-request-id'] = body.requestId;
    body.options.headers['x-dps-client-session-id'] = body.sessionId;
    body.options.headers['x-dps-api-key'] = AEM.credentials.clientId;
    body.options.headers['x-dps-client-version'] = AEM.credentials.clientVersion;
    if(body.uploadId) body.options.headers['x-dps-upload-id'] = body.uploadId;
    if(body.image && body.image.sizes) {body.options.headers['x-dps-image-sizes'] = body.image.sizes}
    body.options.headers['Authorization'] = body.authentication.token_type + ' ' + body.authentication.access_token;

    return body;
};

Remote.prototype.useProxy = function(body) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    switch(body.options.hostname) {
        case AEM.endPoints.authentication:
            body.options.port = "60101";
            break;
        case AEM.endPoints.authorization:
            body.options.port = "60102";
            break;
        case AEM.endPoints.ingestion:
            body.options.port = "60103";
            break;
        case AEM.endPoints.notification:
            body.options.port = "60104";
            break;
        case AEM.endPoints.producer:
            body.options.port = "60105";
            break;
        case AEM.endPoints.product:
            body.options.port = "60106";
            break;
    }
    body.options.hostname = "localhost";

    return body;
};

AEM.Remote = Remote;