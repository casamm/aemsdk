var AEMM = require('../aemm');
const https = require('https');
const fs = require('fs');
const path = require('path');

const topLevel = ['defaultCardTemplate', 'defaultLayout', 'topLevelContent', 'topLevelPhoneContent', 'topLevelTabletContent'];

/**
 * Entity constructor
 * @constructor
 */
function Entity() {}

Entity.prototype.temp = function(data) {
    return
};

/**
 * Request for a list of entities of the same collection type.
 * The list (pageSize) is limited to 25 entities, unless otherwise specified.
 * @param data
 * @returns {Promise}
 */
Entity.prototype.requestList = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'GET',
            hostname: 'pecs.publish.adobe.io',
            path: '/publication/' + data.schema.publicationId + '/' + (data.query ? 'entity?' + data.query : data.schema.entityType),
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
                var result = JSON.parse(Buffer.concat(buffers).toString());
                response.statusCode == 200 ? (data.entities = result, resolve(data)) : reject(result);
            });
        }).on('error', reject);
        request.end(JSON.stringify(data.schema));
    });
};

Entity.prototype.requestMetadata = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'GET',
            hostname: 'pecs.publish.adobe.io',
            path: data.href ? data.href.split(';')[0] : '/publication/' + data.schema.publicationId + '/' + data.schema.entityType + '/' + data.schema.entityName,
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

Entity.prototype.requestEntity = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'GET',
            hostname: 'pecs.publish.adobe.io',
            path: data.schema._links.contentUrl.href + (data.path || ''),
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
            if(response.statusCode == 200) {
                resolve(response);
            } else {
                var buffers = [];
                response.on('data', function(chunk){buffers.push(chunk)});
                response.on('end', function(){reject(JSON.parse(Buffer.concat(buffers).toString()))});
            }
        }).on('error', reject);
        request.end(JSON.stringify(data.schema));
    });
};

/**
 * Create (or update) the article, banner, or collection entity.
 * @param data Expects schema property on the data
 * @returns {Promise} Resolves to an object with updated property schema on successful creation
 */
Entity.prototype.create = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'PUT',
            hostname: 'pecs.publish.adobe.io',
            path: '/publication/' + data.schema.publicationId + '/' + data.schema.entityType + '/' + data.schema.entityName,
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
                var result = JSON.parse(Buffer.concat(buffers).toString());
                response.statusCode == 201 ? (data.schema = result, resolve(data)) : reject(result);
            });
        }).on('error', reject);
        request.end(JSON.stringify(data.schema));
    });
};

/**
 * Update the article, banner, or collection entity.
 * @param data all the values from the update field are posted to update the entity's schema
 * @returns {Promise}
 */
Entity.prototype.update = function(data) {
    return new Promise(function(resolve, reject){
        for(var key in data.update) { data.schema[key] = data.update[key] }
        var request = https.request({
            method: 'PUT',
            hostname: 'pecs.publish.adobe.io',
            path: '/publication/' + data.schema.publicationId + '/' + data.schema.entityType + '/' + data.schema.entityName + ';version=' + data.schema.version,
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
                var result = JSON.parse(Buffer.concat(buffers).toString());
                response.statusCode == 200 ? (data.schema = result, resolve(data)) : reject(result);
            });
        }).on('error', reject);
        request.end(JSON.stringify(data.schema));
    });
};

/**
 * Delete the article, banner, or collection entity.
 * @param data
 * @returns {Promise}
 */
Entity.prototype.delete = function(data) {
    return new Promise(function(resolve, reject){
        if(data.schema && topLevel.indexOf(data.schema.entityName) != -1) {resolve(data); return};
        var request = https.request({
            method: 'DELETE',
            hostname: 'pecs.publish.adobe.io',
            path: data.href ? data.href : '/publication/' + data.schema.publicationId + '/' + data.schema.entityType + '/' + data.schema.entityName + ';version=' + data.schema.version,
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
                response.statusCode == 204 ? resolve() : reject(JSON.parse(Buffer.concat(buffers).toString()));
            });
        }).on('error', reject);
        request.end(JSON.stringify(data.schema));
    });
};

/**
 * Upload an file to the article, banner, or collection entity.
 * Must perform an update() with reference to this file, follow by a seal() to commit the file change.
 * @param data Expects property upload:{file: '', path: '', sizes: ''}, sizes is an optional comma separated list specifying thumbnail sizes
 * @returns {Promise} resolves empty or rejects with error
 */
Entity.prototype.uploadFile = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'PUT',
            hostname: 'pecs.publish.adobe.io',
            path: data.schema._links.contentUrl.href + data.upload.path,
            headers: {
                'Accept': 'application/json;charset=UTF-8',
                'Content-Type': AEMM.mimetypes[data.upload.file.split('.').pop()],
                'Authorization': AEMM.authentication.getToken().token_type + ' ' + AEMM.authentication.getToken().access_token,
                'x-dps-client-request-id': AEMM.genUUID(),
                'x-dps-client-session-id': data.sessionId || (data.sessionId = AEMM.genUUID()),
                'x-dps-upload-id': data.uploadId || (data.uploadId = AEMM.genUUID()),
                'x-dps-image-sizes': data.upload.sizes || [],
                'x-dps-api-key': AEMM.credentials.clientId,
                'x-dps-client-version': AEMM.credentials.clientVersion
            }
        }, function(response){
            var buffers = [];
            response.on('data', function(chunk) {buffers.push(chunk)});
            response.on('end', function(){
                response.statusCode == 200 ? resolve() : reject(JSON.parse(Buffer.concat(buffers).toString()));
            });
        }).on('error', reject);
        var readStream = fs.ReadStream(data.upload.file);
        readStream.on('error', reject);
        readStream.on('close', function(){request.end()});
        readStream.pipe(request);
    });
};

/**
 * Upload images specified by images array to the datum to the article, banner, or collection entity.
 * Must perform an update() with reference to this image, follow by a seal() to commit the image change.
 * Relies on uploadFile() to upload the image file.
 * @param data
 * @returns {Promise}
 */
Entity.prototype.uploadImages = function(data) {
    return new Promise(function(resolve, reject){
        Promise.all(data.images.map(function(image){
            var temp = { // create temp object while retaining sessionId, uploadId values for concurrent requests to uploadFile
                schema: data.schema,
                upload: image,
                sessionId: data.sessionId,
                uploadId: data.uploadId || (data.uploadId = AEMM.genUUID())
            };
            return Entity.prototype.uploadFile.call(null, temp).then(function(meta){
                return meta || {href: 'contents/' + image.path};
            })
        })).then(function(result){
            for(var i=0; i<result.length; i++) {
                data.schema._links[data.images[i].path.split('/')[1]] = result[i];
            }
            resolve(data);
        }).catch(reject);
    });
};

/**
 * Seal the article, banner, or collection entity.
 * This is necessary after an image file upload, to commit the changes.
 * @param data
 * @returns {Promise}
 */
Entity.prototype.seal = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'PUT',
            hostname: 'pecs.publish.adobe.io',
            path: '/publication/' + data.schema.publicationId + '/' + data.schema.entityType + '/' + data.schema.entityName + ';version=' + data.schema.version + '/contents',
            headers: {
                'Accept': 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': AEMM.authentication.getToken().token_type + ' ' + AEMM.authentication.getToken().access_token,
                'x-dps-client-request-id': AEMM.genUUID(),
                'x-dps-client-session-id': data.sessionId || (data.sessionId = AEMM.genUUID()),
                'x-dps-upload-id': data.uploadId,
                'x-dps-api-key': AEMM.credentials.clientId,
                'x-dps-client-version': AEMM.credentials.clientVersion
            }
        }, function(response){
            var buffers = [];
            response.on('data', function(chunk) {buffers.push(chunk)});
            response.on('end', function(){
                var result = JSON.parse(Buffer.concat(buffers).toString());
                response.statusCode == 200 ? (data.schema = result, resolve(data)) : reject(result);
            });
        }).on('error', reject);
        request.end(JSON.stringify(data.schema));
    });
};

/**
 * Triggers the publishing job for entities
 * Article only: will prevent publishing if article is not ingested successfully.
 * Collection only: publish all immediate children entities.
 * Publication only: preview all contents.
 * @param data
 * @returns {Promise} workflow
 */
var job = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'POST',
            hostname: 'pecs.publish.adobe.io',
            path: '/job',
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
                var result = JSON.parse(Buffer.concat(buffers).toString());
                response.statusCode == 200 ? resolve(result) : reject(result);
            });
        }).on('error', reject);
        request.end(JSON.stringify(data.schema));
    });
};

/**
 * Relies on the job() method to publish the entity.
 * @param data publish a single job or group them via entities array from requestList
 * @returns {Promise}
 */
Entity.prototype.publish = function(data) {
    return new Promise(function(resolve, reject){
        var task = {
            schema: {
                workflowType: 'publish',
                entities: data.entities ?
                    data.entities.map(function(item){return item.href})
                    : ['/publication/' + data.schema.publicationId + '/' + data.schema.entityType + '/' + data.schema.entityName + ';version=' + data.schema.version]
            },
            sessionId: data.sessionId
        };
        job(task).then(function(workflow){
            data.workflow = workflow;
            resolve(data);
        }).catch(reject);
    });
};

/**
 * Relies on the job() method to publish the entity.
 * @param data publish a single job or group them via entities array from requestList
 * @returns {Promise}
 */
Entity.prototype.unpublish = function(data) {
    return new Promise(function(resolve, reject){
        var temp = {
            schema: {
                workflowType: 'unpublish',
                entities: data.entities ?
                    data.entities.filter(function(item){return topLevel.indexOf(AEMM.matchUrl(item.href)[2]) == -1}).map(function(value){return value.href}) // filter topLevel entities
                    : ['/publication/' + data.schema.publicationId + '/' + data.schema.entityType + '/' + data.schema.entityName + ';version=' + data.schema.version] // if publishing self
            },
            sessionId: data.sessionId
        };
        if(!data.entities && topLevel.indexOf(data.schema.entityName) != -1) {resolve(data); return} // if publish self is topLevel entity, Top-level entities cannot be unpublished.
        return job(temp).then(function(workflow){
            data.aspect = 'unpublishing';
            data.workflow = workflow;
            resolve(data);
        }).catch(reject);
    });
};

/**
 * Rely on the _job() method to trigger the Preflight for the publication
 * @param data
 * @returns {Promise}
 */
Entity.prototype.preflight = function(data) {
    return new Promise(function(resolve, reject){
        var task = {
            schema: {
                workflowType: 'preview',
                publicationId: data.schema.publicationId
            }
        };
        return job(task).then(function(workflow){
            data.aspect = 'preview';
            data.workflow = workflow;
            resolve(data);
        }).catch(reject);
    });
};

/**
 * Get the status on a workflow
 * @param data
 * @returns {Promise} resolved with an object populated with workflowStatus having a status field with values (RUNNING, COMPLETED, NOT_FOUND)
 */
Entity.prototype.requestWorkflow = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'GET',
            hostname: 'pecs.publish.adobe.io',
            path: '/status/' + data.schema.publicationId + '/workflow/' + data.workflow.workflowId,
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
                var result = JSON.parse(Buffer.concat(buffers).toString());
                response.statusCode == 200 ? (data.workflowStatus = result, resolve(data)) : reject(result);
            });
        }).on('error', reject);
        request.end(JSON.stringify(data.schema));
    });
};

Entity.prototype.requestReferencing = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'GET',
            hostname: 'pecs.publish.adobe.io',
            path: '/publication/' + data.schema.publicationId + '/' + data.schema.entityType + '/' + data.schema.entityName + ';version=' + data.schema.version + '/' + data.referencingEntityType,
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
                response.statusCode == 200 ? (data.referencingEntities = result, resolve(data)) : reject(result);
            });
        }).on('error', reject);
        request.end(JSON.stringify(data.schema));
    });
};

Entity.prototype.requestStatus = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'GET',
            hostname: 'pecs.publish.adobe.io',
            path: '/status/' + data.schema.publicationId + '/' + data.schema.entityType + '/' + data.schema.entityName,
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
                response.statusCode == 200 ? (data.status = result, resolve(data)) : reject(result);
            });
        }).on('error', reject);
        request.end(JSON.stringify(data.schema));
    });
};

Entity.prototype.addStatusObserver = function(data) {
    return AEMM.observer.addStatusObserver(data);
};

Entity.prototype.addWorkflowObserver = function(data) {
    return AEMM.observer.addWorkflowObserver(data);
};

Entity.prototype.enqueue = function(data){
    return AEMM.publish.enqueue(data);
};

Entity.prototype.dequeue = function(data) {
    return AEMM.unpublish.enqueue(data);
};

Entity.TYPE = 'entity';

AEMM.Entity = Entity;

require('./article');
require('./collection');
require('./font');
require('./layout');
require('./cardtemplate');
require('./publication');
require('./sharedcontent');