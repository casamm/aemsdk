var AEMM = require("../aemm");

const https = require('https');
const fs = require('fs');
const path = require('path');
const authentication = new AEMM.Authentication();

/**
 * Remote constructor
 * @constructor
 */
function HttpObject() {}

/**
 * Execute a server http request
 * @param body
 * @returns {Promise}
 */
HttpObject.prototype.request = function(body) {
    return authentication.getToken(body)
        .then(useProxy)
        .then(execute);
};

function execute(body) {
    return new Promise(function(resolve, reject){

        var req = https.request(body.options, function(res){
            response(res).then(function(data){
                delete body.options;
                delete body.authentication;
                resolve(data);
            }).catch(reject);
        }).on('error', reject);

        switch(body.options.headers['content-type']) { // request
            case AEMM.mimetypes.json:
                req.end(JSON.stringify(body.schema));
                break;
            case AEMM.mimetypes.urlencoded:
                req.end();
                break;
            case AEMM.mimetypes.js:
            case AEMM.mimetypes.css:
            case AEMM.mimetypes.jpeg:
            case AEMM.mimetypes.png:
            case AEMM.mimetypes.otf:
            case AEMM.mimetypes.ttf:
            case AEMM.mimetypes.woff:
            case AEMM.mimetypes.octetstream:
            case AEMM.mimetypes.article:
                var readStream = fs.ReadStream(body.upload.path);
                if(readStream) {
                    readStream.on('error', reject);
                    readStream.on('close', function(){req.end()});
                    readStream.pipe(req);
                }
                break;
            default:
                reject("Non-supported content-type " + body.options.headers['content-type']);
        }
    });
}

function response(res) {
    return new Promise(function(resolve, reject){
        var url;
        var writeStream;
        var request = res.req;

        switch (res.headers['content-type']) {
            case AEMM.mimetypes.json:
            case AEMM.mimetypes.json_utf8:
                var buffers = [];
                res.on('data', function(chunk) {buffers.push(chunk)});
                res.on('end', function(){
                    var data = JSON.parse(buffers.length ? Buffer.concat(buffers).toString() : '""');
                    res.statusCode >= 200 && res.statusCode < 300 ? resolve(data) : reject(data);
                });
                break;
            case AEMM.mimetypes.jpeg:
            case AEMM.mimetypes.png:
            case AEMM.mimetypes.gif:
                var matches = AEMM.matchContentUrl(request.path); // 1 pubId, 3, entityType , 4, entityName 5. subpath 6. filename
                var tmp = AEMM.tmpDir(path.join(matches[1], matches[3], matches[4], matches[5]));
                url = path.join(tmp, matches[6] + "." + res.headers['content-type'].match(/image\/(.*)/)[1]);
                writeStream = fs.createWriteStream(url);
                break;

            case AEMM.mimetypes.otf:
            case AEMM.mimetypes.ttf:
            case AEMM.mimetypes.woff:
            case AEMM.mimetypes.octetstream:
                switch(request.method) {
                    case "GET":
                        var matches = AEMM.matchContentUrl(request.path); // 1 pubId, 3, entityType , 4, entityName 5. subpath 6. filename
                        var tmp = AEMM.tmpDir(path.join(matches[1], matches[3], matches[4]));
                        url = path.join(tmp, matches[6] + "." + (matches[6] == "web" ? "woff" : "otf"));
                        writeStream = fs.createWriteStream(url);
                        break;
                    case "PUT": // font, empty response if imageSizes not provided, applies to article socialSharing image too
                    case "DELETE":
                        var data = '';
                        res.on('data', function(chunk) {data += chunk});
                        res.on('end', function(){
                            res.statusCode >= 200 && res.statusCode < 300 ? resolve(data) : reject(data);
                        });
                        break;
                    default:
                        reject("Method not supported", request.method);
                }
                break;
            case AEMM.mimetypes.html:
            case AEMM.mimetypes.plain:
            case AEMM.mimetypes.js:
            case AEMM.mimetypes.css:
                var matches = AEMM.matchContentUrl(request.path); // 1 pubId, 3, entityType , 4, entityName 5. subpath 6. filename
                var tmp = AEMM.tmpDir(path.join(matches[1], matches[3], matches[4]));
                url = path.join(tmp, matches[6]);
                writeStream = fs.createWriteStream(url);
                break;
            default:
                reject("Non-supported content-type " + res.headers['content-type']);
        }

        if(writeStream) {
            res.pipe(writeStream);
            writeStream.on('error', reject);
            res.on('end', function(){writeStream.end()});
            writeStream.on('finish', function(){
                resolve(url);
            });
        }

    });
}

function useProxy(body) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    switch(body.options.hostname) {
        case AEMM.endPoints.authentication:
            body.options.port = "60101";
            break;
        case AEMM.endPoints.authorization:
            body.options.port = "60102";
            break;
        case AEMM.endPoints.ingestion:
            body.options.port = "60103";
            break;
        case AEMM.endPoints.notification:
            body.options.port = "60104";
            break;
        case AEMM.endPoints.producer:
            body.options.port = "60105";
            break;
        case AEMM.endPoints.product:
            body.options.port = "60106";
            break;
    }
    body.options.hostname = "localhost";

    return body;
}

AEMM.HttpObject = HttpObject;