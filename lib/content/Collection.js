var AEMM = require("../aemm");
const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Collection constructor
 * @constructor
 */
function Collection() {
    AEMM.Entity.call(this);
}

Collection.prototype = Object.create(AEMM.Entity.prototype);
Collection.prototype.constructor = Collection;

Collection.prototype.downloadImages = function(data) {
    return new Promise(function(resolve, reject){
        var hrefs = [];
        Object.keys(data.schema._links).forEach(function(key){
            if(["thumbnail", "background", "socialSharing"].indexOf(key) != -1) {
                hrefs.push(data.schema._links[key].href.match(/contents\/(.*)/)[1]);
                if(data.downSamples && data.schema._links[key].downSamples) {
                    data.schema._links[key].downSamples.forEach(function(item){
                        hrefs.push(item.href.match(/contents\/(.*)/)[1]);
                    });
                }
            }
        });
        data.images = [];
        Promise.all(hrefs.map(function(item){
            var temp = {schema: data.schema, path: item, sessionId: data.sessionId, authentication: data.authentication};
            return AEMM.Entity.prototype.requestEntity.call(this, temp)
                .then(function(response){
                    return new Promise(function(resolve, reject){
                        var matches = AEMM.matchContentUrlPath(response.req.path); // 1 pubId, 3, entityType , 4, entityName 5. version 6. subpath 7. filename
                        var tmp = AEMM.tmpDir(path.join(matches[1], matches[3], matches[4], matches[6]));
                        var url = path.join(tmp, matches[7] + '.' + response.headers['content-type'].match(/image\/(.*)/)[1]);
                        var writeStream = fs.createWriteStream(url);
                        response.pipe(writeStream);
                        writeStream.on('error', reject);
                        response.on('end', function(){writeStream.end()});
                        writeStream.on('finish', function(){
                            data.images.push(url);
                            resolve(url);
                        });
                    });
                })
        })).then(function(){
            resolve(data);
        }).catch(reject);
    });
};

Collection.prototype.addEntity = function(data) {
    var exists = false;
    data.contentElements = data.contentElements || [];
    for(var i=0; i<data.contentElements.length; i++) {
        if(data.contentElements[i].href == data.contentElement.href) {
            exists = true;
            break;
        }
    }
    if(!exists) {
        data.isLatestFirst ? data.contentElements.unshift(data.contentElement) : data.contentElements.push(data.contentElement);
    }
    return data;
};

Collection.prototype.removeEntity = function(data) {
    for(var i=0; i<data.contentElements.length; i++) {
        if(data.contentElements[i].href == data.contentElement.href) {
            data.contentElements.splice(i, 1);
            break;
        }
    }
    return data;
};

Collection.prototype.requestContentElements = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: "GET",
            hostname: 'pecs.publish.adobe.io',
            path: data.schema._links.contentElements.href,
            headers: {
                'Accept': 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': AEMM.authentication.getToken().token_type + ' ' + AEMM.authentication.getToken().access_token,
                'x-dps-client-request-id': AEMM.genUUID(),
                'x-dps-client-session-id': data.sessionId || (data.sessionId = AEMM.genUUID()),
                'x-dps-api-key': AEMM.credentials.clientId,
                'x-dps-client-version': AEMM.credentials.clientVersion
            }
        }, function(response){
            var buffers = [];
            response.on('data', function(chunk){buffers.push(chunk)});
            response.on('end', function(){
                var result = JSON.parse(Buffer.concat(buffers).toString());
                response.statusCode == 200 ? (data.contentElements = result, resolve(data)) : reject(result);
            });
        }).on('error', reject);
        request.end(JSON.stringify(data.schema));
    });
};

Collection.prototype.updateContentElements = function(data) {
    return new Promise(function(resolve, reject){
        var schema = data.contentElements.map(function(item){return {href: item.href.split(";version=")[0]}});
        var request = https.request({
            method: "PUT",
            hostname: 'pecs.publish.adobe.io',
            path: data.schema._links.contentElements.href,
            headers: {
                'Accept': 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': AEMM.authentication.getToken().token_type + ' ' + AEMM.authentication.getToken().access_token,
                'x-dps-client-request-id': AEMM.genUUID(),
                'x-dps-client-session-id': data.sessionId || (data.sessionId = AEMM.genUUID()),
                'x-dps-api-key': AEMM.credentials.clientId,
                'x-dps-client-version': AEMM.credentials.clientVersion
            }
        }, function(response){
            var buffers = [];
            response.on('data', function(chunk){buffers.push(chunk)});
            response.on('end', function(){
                var result = JSON.parse(Buffer.concat(buffers).toString());
                response.statusCode == 200 ? (data.schema = result, resolve(data)) : reject(result);
            });
        }).on('error', reject);
        request.end(JSON.stringify(schema));
    });
};

Collection.TYPE = "collection";

AEMM.Collection = Collection;
