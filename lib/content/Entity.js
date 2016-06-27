var AEM = require('../aem');

var Entity = (function(){

    var remote = new AEM.Remote();

    /**
     * Entity constructor
     * @constructor
     */
    function Entity() {}

    Entity.prototype.requestMetadata = function(data) {
        return new Promise(function(resolve, reject){
            data.requestId = AEM.genUUID();
            var options = {
                hostname: require('../configuration/end-points.json').producer,
                path: '/publication/' + data.metadata.publicationId + '/' + data.metadata.entityType + "/" + data.metadata.entityName,
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'x-dps-client-request-id': data.requestId,
                    'x-dps-client-session-id': data.sessionId
                }
            };

            remote.request(options, null).then(function(metadata){
                data.metadata = metadata;
                resolve(data);
            }, function(error){
                data.error = error;
                reject(data);
            });
        });
    };

    Entity.prototype.create = function(data) {
        return new Promise(function(resolve, reject){
            data.requestId = AEM.genUUID();
            var options = {
                hostname: require('../configuration/end-points.json').producer,
                path: '/publication/' + data.metadata.publicationId + '/' + data.metadata.entityType + "/" + data.metadata.entityName,
                method: 'PUT',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'x-dps-client-request-id': data.requestId,
                    'x-dps-client-session-id': data.sessionId
                }
            };

            remote.request(options, JSON.stringify(data.metadata)).then(function(metadata){
                data.metadata = metadata;
                resolve(data);
            }, function(error){
                data.error = error;
                reject(data);
            });
        });
    };

    Entity.prototype.update = function(data) {
        return new Promise(function(resolve, reject){
            data.requestId = AEM.genUUID();
            var options = {
                hostname: require('../configuration/end-points.json').producer,
                path: "/publication/" + data.metadata.publicationId + "/" + data.metadata.entityType + "/" + data.metadata.entityName + ";version=" + data.metadata.version,
                method: 'PUT',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'x-dps-client-request-id': data.requestId,
                    'x-dps-client-session-id': data.sessionId
                }
            };

            remote.request(options, JSON.stringify(data.metadata)).then(function(metadata){
                data.metadata = metadata;
                resolve(data);
            }, function(error){
                data.error = error;
                reject(data);
            });
        });
    };

    Entity.prototype.uploadImage = function(data) {
        return new Promise(function(resolve, reject){
            data.requestId = AEM.genUUID();
            var options = {
                hostname: require('../configuration/end-points.json').producer,
                path: data.metadata._links.contentUrl.href + "images/" + data.imageType,
                method: 'PUT',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'image/png',
                    'x-dps-client-request-id': data.requestId,
                    'x-dps-client-session-id': data.sessionId,
                    'x-dps-upload-id': data.uploadId,
                    'x-dps-image-sizes': '2048, 1536, 1080, 768, 640, 540, 320'
                }
            };

            remote.upload(options, data).then(function(metadata){
                resolve(data); //not setting metadata since service returns no content
            }, function(error){
                data.error = error;
                reject(data);
            });
        });
    };

    Entity.prototype.seal = function(data) {
        return new Promise(function(resolve, reject){
            data.requestId = AEM.genUUID();
            var options = {
                hostname: require('../configuration/end-points.json').producer,
                path: "/publication/" + data.metadata.publicationId + "/" + data.metadata.entityType + "/" + data.metadata.entityName + ";version=" + data.metadata.version + "/contents",
                method: 'PUT',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'x-dps-client-request-id': data.requestId,
                    'x-dps-client-session-id': data.sessionId,
                    'x-dps-upload-id': data.uploadId
                }
            };

            remote.request(options, null).then(function(metadata){
                data.metadata = metadata;
                resolve(data);
            }, function(error){
                data.error = error;
                reject(data);
            });
        });
    };

    /**
     * Request for a list of entities of the same entity type.
     * The list (pageSize) is limited to 25 entities, unless otherwise specified.
     * @param data
     * @returns {Promise}
     */
    Entity.prototype.requestList = function(data) {
        return new Promise(function(resolve, reject){
            data.requestId = AEM.genUUID();
            var options = {
                hostname: require('../configuration/end-points.json').producer,
                port: 443,
                path: '/publication/' + data.metadata.publicationId + '/' + data.metadata.entityType + (data.query ? data.query : ''),
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'x-dps-client-request-id': data.requestId,
                    'x-dps-client-session-id': data.sessionId
                }
            };
            
            remote.request(options).then(function(list){
                data.list = list;
                resolve(data);
            }, function(error){
                data.error = error;
                reject(data);
            });
        });
    };

    Entity.prototype.delete = function(data) {
        return new Promise(function(resolve, reject){
            data.requestId = AEM.genUUID();
            var options = {
                hostname: require('../configuration/end-points.json').producer,
                path: "/publication/" + data.metadata.publicationId + "/" + data.metadata.entityType + "/" + data.metadata.entityName + ";version=" + data.metadata.version,
                method: 'DELETE',
                headers: {
                    'x-dps-client-request-id': data.requestId,
                    'x-dps-client-session-id': data.sessionId
                }
            };

            remote.request(options, null).then(function(metadata){
                resolve(data);
            }, function(error){
                data.error = error;
                reject(data);
            });
        });
    };

    Entity.prototype.publish = function(data) {
        return new Promise(function(resolve, reject){
            data.requestId = AEM.genUUID();
            var options = {
                hostname: require('../configuration/end-points.json').producer,
                path: "/job",
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'x-dps-client-request-id': data.requestId,
                    'x-dps-client-session-id': data.sessionId
                }
            };

            remote.request(options, JSON.stringify(data.publish)).then(function(metadata){
                data.workflowId = metadata.workflowId;
                resolve(data);
            }, function(error){
                data.error = error;
                reject(data);
            });
        });
    };

    Entity.TYPE = 'entity';

    return Entity;
})();

AEM.Entity = Entity;

require('./article');
require('./collection');
require('./layout');