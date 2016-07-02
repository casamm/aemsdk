var AEM = require("../aem");

var Collection = (function(){

    var remote = new AEM.Remote();

    /**
     * Collection constructor
     * @constructor
     */
    function Collection() {
        AEM.Entity.call(this);
    }

    Collection.prototype = Object.create(AEM.Entity.prototype);
    Collection.prototype.constructor = Collection;

    Collection.prototype.addEntity = function(body) {
        var exists = false;
        body.contentElements = body.contentElements || [];
        for(var i=0; i<body.contentElements.length; i++) {
            if(body.contentElements[i].href == body.contentElement.href) {
                exists = true;
                break;
            }
        }
        if(!exists) {
            body.isLatestFirst ? body.contentElements.unshift(body.contentElement) : body.contentElements.push(body.contentElement);
        }
        return body;
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

    Collection.prototype.requestContentElements = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: body.entity._links.contentElements.href,
            method: 'GET'
        };
        return remote.request(body).then(function(contentElements){
            for(var i=0; i<contentElements.length; i++) {
                contentElements[i].href = contentElements[i].href.split(';version=')[0];
            }
            body.contentElements = contentElements;
            return body;
        });
    };

    Collection.prototype.updateContentElements = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.producer,
            path: body.entity._links.contentElements.href,
            method: 'PUT'
        };

        for(var i=0; i<body.contentElements.length; i++) {
            body.contentElements[i].href = body.contentElements[i].href.split(';version=')[0];
        }
        body.entity = body.contentElements; //for remote.request

        return remote.request(body).then(function(entity){
            body.entity = entity;
            return body;
        });
    };

    Collection.prototype.publish = function(body) {
        body.entity = {
            workflowType: "publish",
            entities: ['/publication/' + body.entity.publicationId + '/collection/' + body.entity.entityName + ';version=' + body.entity.version]
        };
        return AEM.Entity.prototype.publish.call(this, body);
    };

    Collection.prototype.unpublish = function(body) {
        body.entity = {
            workflowType: "unpublish",
            entities: ['/publication/' + body.entity.publicationId + '/collection/' + body.entity.entityName + ';version=' + body.entity.version]
        };
        return AEM.Entity.prototype.publish.call(this, body);
    };
    
    return Collection;

}());

AEM.Collection = Collection;
