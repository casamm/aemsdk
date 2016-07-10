var AEM = require("../aem");

/**
 * Entity constructor
 * @constructor
 */
function Entity() {}

Entity.prototype.create = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.producer,
        path: "/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName,
        method: "PUT"
    };
    return AEM.remote.request(body).then(function(schema){
        body.schema = schema;
        return body;
    });
};

Entity.prototype.update = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.producer,
        path: "/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName + ";version=" + body.schema.version,
        method: "PUT"
    };
    return AEM.remote.request(body).then(function(entity){
        body.schema = entity;
        return body;
    });
};

Entity.prototype.uploadImage = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.producer,
        path: body.schema._links.contentUrl.href + "images/" + body.file.type,
        method: "PUT",
        headers: {"content-type": "image/" + body.file.path.split(".").pop()}
    };
    return AEM.remote.request(body).then(function(entity){
        body.schema._links[body.file.type] = entity ? entity : {href: "contents/images/" + body.file.type};
        return body;
    });
};

Entity.prototype.seal = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.producer,
        path: "/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName + ";version=" + body.schema.version + "/contents",
        method: "PUT"
    };
    return AEM.remote.request(body).then(function(entity){
        body.schema = entity;
        delete body.file;
        return body;
    });
};

Entity.prototype.delete = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.producer,
        path: "/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName + ";version=" + body.schema.version,
        method: "DELETE"
    };
    return AEM.remote.request(body).then(function(data){
        return body;
    });
};

var job = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.producer,
            path: "/job",
            method: "POST"
    };
    return AEM.remote.request(body);
};

Entity.prototype.publish = function(body) {
    var task = {
        schema: {
            workflowType: "publish",
            entities: ["/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName + ";version=" + body.schema.version]
        }
    };
    return job(task).then(function(result){
        body.workflowId = result.workflowId;
        return body;
    });
};

Entity.prototype.unpublish = function(body) {
    var task = {
        schema: {
            workflowType: "unpublish",
            entities: ["/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName + ";version=" + body.schema.version]
        }
    };
    return job(task).then(function(result){
        body.workflowId = result.workflowId;
        return body;
    });
};

Entity.prototype.preflight = function(body) {
    var task = {
        schema: {
            workflowType: "preview",
            publicationId: body.schema.publicationId
        }
    };
    return job(task).then(function(result){
        body.workflowId = result.workflowId;
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
        path: "/publication/" + body.schema.publicationId + "/" + (body.query ? body.query : body.schema.entityType),
        method: "GET"
    };
    return AEM.remote.request(body).then(function(data){
        body.query ? (body[body.query.split("==")[1] + "s"] = data) : (body[body.schema.entityType + "s"] = data);
        return body;
    });
};

Entity.prototype.requestMetadata = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.producer,
        path: "/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName,
        method: "GET"
    };
    return AEM.remote.request(body).then(function(entity){
        body.schema = entity;
        return body;
    });
};

Entity.prototype.requestEntity = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.producer,
        path: body.schema._links.contentUrl.href + (body.href ? body.href : ""),
        method: "GET"
    };
    return AEM.remote.request(body).then(function(entity){
        if(body.href) { // thumbnail, background etc.
            body[body.href.split("/")[1]] = entity.file.path;
        } else { // article manifest
            body["contentUrl"] = entity;
        }
        return body;
    });
};

Entity.prototype.requestStatus = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.producer,
        path: "/status/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName,
        method: "GET"
    };
    return AEM.remote.request(body).then(function(status){
        body.status = status;
        return body;
    });
};

Entity.TYPE = "entity";

AEM.Entity = Entity;

require("./article");
require("./collection");
require("./font");
require("./layout");
require("./cardTemplate");
require("./publication");
