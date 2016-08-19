var AEMM = require('../aemm');
var https = require('https');

function Product() {}

/**
 * Create (or update) the product or product bundle.
 * @param data
 * @returns {*}
 */
Product.prototype.create = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'PUT',
            hostname: 'ps.publish.adobe.io',
            path: '/applications/' + data.publicationId + '/' + data.entityType + 's/' + data.schema.id,
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
            console.log('response');
            var buffers = [];
            response.on('data', function(chunk){buffers.push(chunk)});
            response.on('end', function(){
                var result = JSON.parse(Buffer.concat(buffers).toString());
                response.statusCode == 200 ? (data.schema = result, resolve(data)) : reject(result);
            });
        }).on('error', reject);
        request.end(JSON.stringify(data.schema));
    });
};

/**
 * Update the product or product bundle
 * @param data
 */
Product.prototype.update = function(data) {
    for(var key in data.update) {data.schema[key] = data.update[key]}
    return Product.prototype.create.call(null, data);
};

/**
 * Delete the product or product bundle.
 * @param data
 * @returns {Promise}
 */
Product.prototype.delete = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'DELETE',
            hostname: 'ps.publish.adobe.io',
            path: '/applications/' + data.publicationId + '/' + data.entityType + 's/' + data.schema.id,
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
            response.on('data', function(chunk) {buffers.push(chunk)});
            response.on('end', function(){
                var result = JSON.parse(buffers.length ? Buffer.concat(buffers).toString(): '""');
                response.statusCode == 204 ? resolve() : reject(result);
            });
        }).on('error', reject);
        request.end(JSON.stringify(data.schema));
    });
};

/**
 * Get the product or product bundle metadata.
 * @param data
 * @returns {Promise}
 */
Product.prototype.requestMetadata = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'GET',
            hostname: 'ps.publish.adobe.io',
            path: '/applications/' + data.publicationId + '/' + data.entityType + 's/' + data.schema.id,
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
        request.end(JSON.stringify(data.schema));
    });
};

/**
 * Get a list of products or product bundles.
 * @param data
 * @returns {Promise}
 */
Product.prototype.requestList = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'GET',
            hostname: 'ps.publish.adobe.io',
            path: '/applications/' + data.publicationId + '/' + data.entityType + 's',
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
                response.statusCode == 200 ? (data.entities = result, resolve(data)) : reject(result);
            });
        }).on('error', reject);
        request.end(JSON.stringify(data.schema));
    });
};

Product.TYPE = "product";

AEMM.Product = Product;

require('./bundle');
