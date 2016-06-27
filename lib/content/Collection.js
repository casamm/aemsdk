var AEM = require("../aem");

var Collection = (function(){

    var remote = new AEM.Remote();

    /**
     * Collection constructor
     * @constructor
     */
    function Collection() {}

    Collection.prototype = Object.create(AEM.Entity.prototype);
    Collection.prototype.constructor = Collection;

    Collection.prototype.addEntity = function(data) {
        var self = this;
        return new Promise(function(resolve, reject){
            self.requestContentElements(data)
                .then(function(data2){
                    var exists = false;
                    for(var i=0; i<data2.contentElements.length; i++) {
                        if(data2.contentElements[i].href == data.entity.href) {
                            exists = true;
                            break;
                        }
                    }
                    if(!exists) {
                        data.isLatestFirst ? data2.contentElements.unshift(data.entity) : data2.contentElements.push(data.entity);
                        return data2;
                    } else {
                        throw Error();
                    }
                })
                .then(self.updateContentElements)
                .then(function(data){
                    resolve(data);
                })
                .catch(function(error){
                    data.error = {code: "EntityExistsException", message: "EntityExistsException errorCode=409 error=entity exists exception"};
                    reject(data);
                });
        });
    };

    Collection.prototype.removeEntity = function(data) {
        var self = this;
        return new Promise(function(resolve, reject){
            if(!data.entity || !data.entity.href) {
                data.error = {code: "BadRequestException", message: "BadRequestException errorCode=400 error=bad request exception"};
                reject(data);
            } else {
                self.requestContentElements(data)
                    .then(function(data2){
                        var exists = false;
                        for(var i=0; i<data2.contentElements.length; i++) {
                            if(data2.contentElements[i].href == data.entity.href) {
                                exists = true;
                                data2.contentElements.splice(i, 1);
                                break;
                            }
                        }
                        if(exists) {
                            return data2;
                        } else {
                            data.error = {code: "EntityNotFoundException", message: "EntityNotFoundException errorCode=404 error=entity not found exception"};
                            reject(data)
                        }
                    })
                    .then(self.updateContentElements)
                    .then(resolve)
                    .catch(reject);
            }
        });
    };

    Collection.prototype.requestContentElements = function(data) {
        return new Promise(function(resolve, reject){
            data.requestId = AEM.genUUID();
            var options = {
                hostname: require('../configuration/end-points.json').producer,
                path: data.metadata._links.contentElements.href,
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'x-dps-client-request-id': data.requestId,
                    'x-dps-client-session-id': data.sessionId
                }
            };

            remote.request(options, null).then(function(contentElements){
                data.contentElements = contentElements;
                resolve(data);
            }, function(error){
                data.error = error;
                reject(data);
            });
        });
    };

    Collection.prototype.updateContentElements = function(data) {
        return new Promise(function(resolve, reject){
            data.requestId = AEM.genUUID();
            var options = {
                hostname: require('../configuration/end-points.json').producer,
                path: data.metadata._links.contentElements.href,
                method: 'PUT',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'x-dps-client-request-id': data.requestId,
                    'x-dps-client-session-id': data.sessionId
                }
            };

            remote.request(options, JSON.stringify(data.contentElements)).then(function(metadata){
                data.metadata = metadata;
                resolve(data)
            }, function(error){
                data.error = error;
                reject(data);
            });
        });
    };

    Collection.prototype.publish = function(data) {
        data.publish = {
            workflowType: "publish",
            entities: ['/publication/' + data.metadata.publicationId + '/collection/' + data.metadata.entityName + ';version=' + data.metadata.version]
        };
        return AEM.Entity.prototype.publish.call(this, data);
    };

    Collection.prototype.unpublish = function(data) {
        data.publish = {
            workflowType: "unpublish",
            entities: ['/publication/' + data.metadata.publicationId + '/collection/' + data.metadata.entityName + ';version=' + data.metadata.version]
        };
        return AEM.Entity.prototype.publish.call(this, data);
    };

    Collection.TYPE = "collection";

    return Collection;

})();

AEM.Collection = Collection;
