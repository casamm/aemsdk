var AEM = require("../aem");

var Entity = (function(){

    /**
     * Entity constructor
     * @constructor
     */
    function Entity() {}

    Entity.prototype.create = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: "/publication/" + body.data.publicationId + "/" + body.data.entityType + "/" + body.data.entityName,
            method: "PUT"
        };
        return AEM.remote.request(body).then(function(data){
            body.data = data;
            return body;
        });
    };

    Entity.prototype.update = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: "/publication/" + body.data.publicationId + "/" + body.data.entityType + "/" + body.data.entityName + ";version=" + body.data.version,
            method: "PUT"
        };
        return AEM.remote.request(body).then(function(entity){
            body.data = entity;
            return body;
        });
    };

    Entity.prototype.uploadImage = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: body.data._links.contentUrl.href + "images/" + body.image.type,
            method: "PUT",
            headers: {"content-type": "image/png"}
        };
        return AEM.remote.request(body).then(function(entity){
            body.data._links[body.image.type] = entity ? entity : {href: "contents/images/" + body.image.type};
            return body;
        });
    };

    Entity.prototype.seal = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: "/publication/" + body.data.publicationId + "/" + body.data.entityType + "/" + body.data.entityName + ";version=" + body.data.version + "/contents",
            method: "PUT"
        };
        return AEM.remote.request(body).then(function(entity){
            body.data = entity;
            return body;
        });
    };

    Entity.prototype.delete = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: "/publication/" + body.data.publicationId + "/" + body.data.entityType + "/" + body.data.entityName + ";version=" + body.data.version,
            method: "DELETE"
        };
        return AEM.remote.request(body).then(function(data){
            return body; //for chain
        });
    };

    Entity.prototype.publish = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: "/job",
            method: "POST"
        };
        return AEM.remote.request(body).then(function(entity){
            body.workflowId = entity.workflowId;
            return body;
        });
    };

    /**
     * Request for a list of entities of the same collection type.
     * The list (pageSize) is limited to 25 entities, unless otherwise specified.
     * @param body
     * @returns {Promise}
     */
    Entity.prototype.requestList = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: "/publication/" + body.data.publicationId + "/" + (body.query ? body.query : "collection"),
            method: "GET"
        };
        return AEM.remote.request(body).then(function(data){
            body[body.data.entityType + "s"] = data;
            return body;
        });
    };

    Entity.prototype.requestMetadata = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: "/publication/" + body.data.publicationId + "/" + body.data.entityType + "/" + body.data.entityName,
            method: "GET"
        };
        return AEM.remote.request(body).then(function(entity){
            body.data = entity;
            return body;
        });
    };

    Entity.prototype.requestEntity = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: body.data._links.contentUrl.href + "images/" + body.image.type,
            method: "GET"
        };
        return AEM.remote.request(body).then(function(entity){
            body[entity.image.type] = entity.image.path;
            delete body.image;
            return body;
        });
    };

    Entity.prototype.requestStatus = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: "/status/" + body.data.publicationId + "/" + body.data.entityType + "/" + body.data.entityName,
            method: "GET"
        };
        return AEM.remote.request(body).then(function(status){
            body.status = status;
            return body;
        });
    };

    Entity.TYPE = "entity";

    return Entity;
    
}());

AEM.Entity = Entity;

require("./article");
require("./collection");
require("./layout");