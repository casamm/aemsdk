var AEM = require('../aem');

var Entity = (function(){

    var authorization = new AEM.Authorization;
    var remote = new AEM.Remote();

    /**
     * Entity constructor
     * @constructor
     */
    function Entity() {}

    Entity.prototype.requestContent = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: body.entity._links.contentUrl.href,
            method: 'GET'
        };
        return remote.request(body).then(function(content){
            body.content = content;
            resolve(body);
        });
    };

    Entity.prototype.requestStatus = function(body) {
        var options = {
            hostname: AEM.config.endPoints.producer,
            path: '/status/' + body.entity.publicationId + '/' + body.entity.entityType + "/" + body.entity.entityName,
            method: 'GET'
        };
        return remote.request(options).then(function(status){
            body.status = status;
            return body;
        });
    };

    /**
     * Request for a list of entities of the same entity type.
     * The list (pageSize) is limited to 25 entities, unless otherwise specified.
     * @param body
     * @returns {Promise}
     */
    Entity.prototype.requestList = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: '/publication/' + body.entity.publicationId + "/" + (body.query ? body.query : 'entity'),
            method: 'GET'
        };
        return remote.request(body).then(function(list){
            body.list = list;
            return body;
        });
    };

    Entity.prototype.requestMetadata = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: '/publication/' + body.entity.publicationId + '/' + body.entity.entityType + "/" + body.entity.entityName,
            method: 'GET'
        };
        return remote.request(body).then(function(entity){
            body.entity = entity;
            return body;
        });
    };

    Entity.prototype.create = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: '/publication/' + body.entity.publicationId + '/' + body.entity.entityType + "/" + body.entity.entityName,
            method: 'PUT'
        };
        return remote.request(body).then(function(entity){
            body.entity = entity;
            return body;
        });
    };

    Entity.prototype.update = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: "/publication/" + body.entity.publicationId + "/" + body.entity.entityType + "/" + body.entity.entityName + ";version=" + body.entity.version,
            method: 'PUT'
        };
        return remote.request(body).then(function(entity){
            body.entity = entity;
            return body;
        });
    };

    Entity.prototype.uploadImage = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: body.entity._links.contentUrl.href + "images/" + body.image.type,
            method: 'PUT',
            headers: {'content-type': 'image/png'}
        };
        return remote.request(body).then(function(entity){
            body.entity._links[body.image.type] = entity ? entity : {href: "contents/images/" + body.image.type};
            return body;
        });
    };

    Entity.prototype.seal = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: "/publication/" + body.entity.publicationId + "/" + body.entity.entityType + "/" + body.entity.entityName + ";version=" + body.entity.version + "/contents",
            method: 'PUT'
        };
        return remote.request(body).then(function(entity){
            body.entity = entity;
            return body;
        });
    };

    Entity.prototype.delete = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: "/publication/" + body.entity.publicationId + "/" + body.entity.entityType + "/" + body.entity.entityName + ";version=" + body.entity.version,
            method: 'DELETE'
        };
        return remote.request(body).then(function(body){return body});
    };

    Entity.prototype.publish = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: "/job",
            method: 'POST'
        };
        return remote.request(body).then(function(entity){
            body.workflowId = entity.workflowId;
            return body;
        });
    };

    return Entity;
    
}());

AEM.Entity = Entity;

require('./article');
require('./collection');
require('./layout');