var AEMM = require("../aemm");

/**
 * Entity constructor
 * @constructor
 */
function Entity() {}

Entity.prototype.create = function(body) {
    body.options = {
        hostname: AEMM.endPoints.producer,
        path: "/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName,
        method: "PUT"
    };
    return AEMM.httpObject.request(body).then(function(schema){
        body.schema = schema;
        return body;
    });
};

Entity.prototype.update = function(body) {
    body.options = {
        hostname: AEMM.endPoints.producer,
        path: "/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName + ";version=" + body.schema.version,
        method: "PUT"
    };
    for(var key in body.update) {
        body.schema[key] = body.update[key];
    }
    return AEMM.httpObject.request(body).then(function(entity){
        body.schema = entity;
        return body;
    });
};

Entity.prototype.uploadFile = function(body) {
    body.uploadId = body.uploadId || AEMM.genUUID();
    body.options = {
        hostname: AEMM.endPoints.producer,
        path: body.schema._links.contentUrl.href + body.upload.path,
        method: "PUT",
        headers: {
            "content-type": AEMM.mimetypes[body.upload.file.split(".").pop()],
            "x-dps-upload-id": body.uploadId,
            "x-dps-image-sizes": body.upload.sizes || []
        }
    };
    return AEMM.httpObject.request(body);
};

Entity.prototype.uploadImages = function(body) {
    body.uploadId = body.uploadId || AEMM.genUUID();
    return Promise.all(body.images.map(function(image){
        var temp = {schema: body.schema, upload: image,
            sessionId: body.sessionId, uploadId: body.uploadId};
        return Entity.prototype.uploadFile.call(null, temp).then(function(meta){
            return meta || {href: "contents/" + image.path};
        });
    })).then(function(result){
        for(var i=0; i<result.length; i++) {
            body.schema._links[body.images[i].path.split("/")[1]] = result[i];
        }
        return body;
    });
};

Entity.prototype.seal = function(body) {
    body.options = {
        hostname: AEMM.endPoints.producer,
        path: "/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName + ";version=" + body.schema.version + "/contents",
        method: "PUT",
        headers: {
            "x-dps-upload-id": body.uploadId
        }
    };
    return AEMM.httpObject.request(body).then(function(entity){
        body.schema = entity;
        body.aspect = "publishing";
        return body;
    });
};

Entity.prototype.delete = function(body) {
    body.options = {
        hostname: AEMM.endPoints.producer,
        path: "/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName + ";version=" + body.schema.version,
        method: "DELETE"
    };
    return AEMM.httpObject.request(body).then(function(data){
        return body;
    });
};

var job = function(body) {
    body.options = {
        hostname: AEMM.endPoints.producer,
            path: "/job",
            method: "POST"
    };
    return AEMM.httpObject.request(body);
};

Entity.prototype.publish = function(body) {
    var temp = {
        schema: {
            workflowType: "publish",
            entities: body.entities ?
                body.entities.map(function(value){return value.href})
                : ["/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName + ";version=" + body.schema.version]
        },
        sessionId: body.sessionId
    };
    return job(temp).then(function(result){
        body.aspect = "publishing";
        body.workflowId = result.workflowId;
        return body;
    });
};

Entity.prototype.unpublish = function(body) {
    var topLevel = ["defaultCardTemplate", "defaultLayout", "topLevelContent", "topLevelPhoneContent", "topLevelTabletContent"];
    var temp = {
        schema: {
            workflowType: "unpublish",
            entities: body.entities ?
                body.entities.filter(function(value){return topLevel.indexOf(AEMM.matchUrl(value.href)[2]) == -1}).map(function(value){return value.href}) // filter topLevel entities
                : ["/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName + ";version=" + body.schema.version] // if publishing self
        },
        sessionId: body.sessionId
    };
    if(temp.schema.entities.length == 0) throw Error("Entities list is empty.");
    if(!body.entities && topLevel.indexOf(body.schema.entityName) != -1) throw Error("Top-level entities cannot be unpublished."); // if publish self is topLevel entity
    return job(temp).then(function(result){
        body.aspect = "unpublishing";
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
        body.aspect = "preview";
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
        hostname: AEMM.endPoints.producer,
        path: "/publication/" + body.schema.publicationId + "/" + (body.query ? 'entity?' + body.query : body.schema.entityType),
        method: "GET"
    };
    return AEMM.httpObject.request(body).then(function(entities){
        body.entities = entities;
        return body;
    });
};

Entity.prototype.requestMetadata = function(body) {
    body.options = {
        hostname: AEMM.endPoints.producer,
        path: body.href ? body.href.split(";")[0] : "/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName,
        method: "GET"
    };
    return AEMM.httpObject.request(body).then(function(entity){
        body.schema = entity;
        return body;
    });
};

Entity.prototype.requestEntity = function(body) {
    body.options = {
        hostname: AEMM.endPoints.producer,
        path: body.schema._links.contentUrl.href + (body.path || ""),
        method: "GET"
    };
    return AEMM.httpObject.request(body);
};

Entity.prototype.downloadFiles = function(body) {
    return Promise.all(body.contentUrl.map(function(item){
        var temp = {
            schema: body.schema,
            path: item.href
        };
        return AEMM.Entity.prototype.requestEntity.call(null, temp);
    })).then(function(result){
        body.files = result;
        return body;
    });
};

Entity.prototype.requestReferencing = function(body) {
    body.options = {
        hostname: AEMM.endPoints.producer,
        path: "/publication/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName + ";version=" + body.schema.version + "/" + body.referencingEntityType,
        method: "GET"
    };
    return AEMM.httpObject.request(body).then(function(result){
        body.referencingEntities = result;
        return body;
    });
};

Entity.prototype.requestStatus = function(body) {
    body.options = {
        hostname: AEMM.endPoints.producer,
        path: "/status/" + body.schema.publicationId + "/" + body.schema.entityType + "/" + body.schema.entityName,
        method: "GET"
    };
    return AEMM.httpObject.request(body).then(function(status){
        body.status = status;
        return body;
    });
};

Entity.prototype.requestWorkflow = function(body) {
    body.options = {
        hostname: AEMM.endPoints.producer,
        path: "/status/" + body.schema.publicationId + "/workflow/" + body.workflowId,
        method: "GET"
    };
    return AEMM.httpObject.request(body).then(function(status){
        body.workflowStatus = status;
        return body;
    });
};

Entity.prototype.addStatusObserver = function(body) { // aspect "ingestion", "publishing" and "preview"
    return new Promise(function(resolve, reject){
        var id = setInterval(function(){
            Entity.prototype.requestStatus.call(this, body)
                .then(function(data){
                    if(data.aspect != null) { // if an observable operation never occurred
                        throw Error("aspect is null");
                    } else if(data.aspect == "unpublishing") { // check publish aspect is not in the status list
                        var found = false;
                        data.status.forEach(function(status){
                             if(status.aspect == "publishing") found = true;
                        });
                        if(!found) {clearInterval(id); resolve(data)} // it's unpublished
                    } else {
                        data.status.forEach(function(status){
                            if(data.aspect == status.aspect) { // observable operation check
                                if(body.notify) body.notify.call(null, status);
                                switch(status.eventType) {
                                    case "progress": break;
                                    case "success": clearInterval(id); resolve(data); break;
                                    case "failure": clearInterval(id); reject(data); break;
                                }
                            }
                        });
                    }
                }).catch(function(error){clearInterval(id); reject(error)}); // if any errors, clearInterval
        }, 1500);
    });
};

Entity.prototype.addWorkflowObserver = function(body) {
    return new Promise(function(resolve, reject){
        var id = setInterval(function(){
            Entity.prototype.requestWorkflow.call(this, body)
                .then(function(data){
                    switch(data.workflowStatus.status) {
                        case "RUNNING": break;
                        case "COMPLETED": clearInterval(id); resolve(data); break;
                        case "NOT_FOUND": clearInterval(id); resolve(data); break;
                    }
                }).catch(function(error){clearInterval(id); reject(error)});
        }, 1500);
    });
};

Entity.TYPE = "entity";

AEMM.Entity = Entity;

require("./article");
require("./collection");
require("./font");
require("./layout");
require("./cardTemplate");
require("./publication");
require("./SharedContent");
