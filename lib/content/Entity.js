var AEM = require("../aem");

/**
 * Entity constructor
 * @constructor
 */
function Entity() {}

Entity.prototype.create = function(body) {
    body.options = {
        hostname: AEM.endPoints.producer,
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
        hostname: AEM.endPoints.producer,
        path: "/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName + ";version=" + body.schema.version,
        method: "PUT"
    };
    for(var key in body.update) {
        body.schema[key] = body.update[key];
    }
    return AEM.remote.request(body).then(function(entity){
        body.schema = entity;
        return body;
    });
};

Entity.prototype.uploadImages = function(body) {
    body.uploadId = body.uploadId || AEM.genUUID();
    return Promise.all(body.images.map(function(image){
        var datum = JSON.parse(JSON.stringify(body));
        datum.image = image;
        datum.options = {
            hostname: AEM.endPoints.producer,
            path: datum.schema._links.contentUrl.href + "images/" + image.type,
            method: "PUT",
            headers: {
                "content-type": AEM.mimetypes[image.path.split(".").pop()]
            }
        };
        return AEM.remote.request(datum).then(function(meta){
            return meta ? meta : {href: "contents/images/" + datum.image.type};
        });
    })).then(function(result){
        for(var i=0; i<result.length; i++) {
            body.schema._links[body.images[i].type] = result[i];
        }
        return body;
    })
};

Entity.prototype.seal = function(body) {
    body.options = {
        hostname: AEM.endPoints.producer,
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
        hostname: AEM.endPoints.producer,
        path: "/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName + ";version=" + body.schema.version,
        method: "DELETE"
    };
    return AEM.remote.request(body).then(function(data){
        return body;
    });
};

var job = function(body) {
    body.options = {
        hostname: AEM.endPoints.producer,
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

Entity.prototype.publishEntities = function(body) {
    var task = {
        schema: {
            workflowType: "publish",
            entities: body.entities.map(function(value, index, array){
                return value.href;
            })
        }
    };
    if(task.schema.entities.length == 0) throw Error("Entities list is empty.");
    return job(task).then(function(result){
        body.workflowId = result.workflowId;
        return body;
    });
};

Entity.prototype.unpublishEntities = function(body) {
    var nonPublishable = ["defaultCardTemplate", "defaultLayout", "topLevelContent", "topLevelPhoneContent", "topLevelTabletContent"];
    var task = {
        schema: {
            workflowType: "unpublish",
            entities: body.entities.filter(function(value, index, array){
                var matches = value.href.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
                return nonPublishable.indexOf(matches[2]) == -1;
            }).map(function(value, index, array){
                return value.href;
            })
        }
    };
    if(task.schema.entities.length == 0) throw Error("Entities list is empty.");
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
        hostname: AEM.endPoints.producer,
        path: "/publication/" + body.schema.publicationId + "/" + (body.query ? 'entity?' + body.query : body.schema.entityType),
        method: "GET"
    };
    return AEM.remote.request(body).then(function(entities){
        body.entities = entities;
        return body;
    });
};

Entity.prototype.requestMetadata = function(body) {
    body.options = {
        hostname: AEM.endPoints.producer,
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
        hostname: AEM.endPoints.producer,
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
        hostname: AEM.endPoints.producer,
        path: "/status/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName,
        method: "GET"
    };
    return AEM.remote.request(body).then(function(status){
        body.status = status;
        return body;
    });
};

Entity.prototype.requestWorkflow = function(body) {
    body.options = {
        hostname: AEM.endPoints.producer,
        path: "/status/" + body.schema.publicationId + "/workflow/" + body.workflowId,
        method: "GET"
    };
    return AEM.remote.request(body).then(function(status){
        body.workflowStatus = status;
        return body;
    });
};

Entity.prototype.addStatusObserver = function(body) {
    return new Promise(function(resolve, reject){
        var id = setInterval(function(){
            Entity.prototype.requestStatus.call(this, body)
                .then(function(data){
                    switch(data.status[0].eventType) {
                        case "progress":
                            if(body.notify) body.notify.call(null, data.status); break;
                        case "success":
                            if(body.notify) body.notify.call(null, data.status);
                            clearInterval(id); resolve(data); break;
                        case "failure":
                            clearInterval(id); reject(data); break;
                    }
                }).catch(function(error){clearInterval(id); reject(error)});
        }, 1000);
    });
};

Entity.prototype.addWorkflowObserver = function(body) {
    return new Promise(function(resolve, reject){
        var id = setInterval(function(){
            Entity.prototype.requestWorkflow.call(this, body)
                .then(function(data){
                    switch(data.workflowStatus.status) {
                        case "RUNNING":
                            if(body.notify) body.notify.call(null, data.workflowStatus); break;
                        case "COMPLETED":
                            if(body.notify) body.notify.call(null, data.workflowStatus);
                            clearInterval(id); resolve(data); break;
                        case "NOT_FOUND": clearInterval(id); resolve(data); break;
                    }
                }).catch(function(error){clearInterval(id); reject(error)});
        }, 1000);
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
