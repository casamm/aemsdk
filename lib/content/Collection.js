var AEMM = require("../aemm");

/**
 * Collection constructor
 * @constructor
 */
function Collection() {
    AEMM.Entity.call(this);
}

Collection.prototype = Object.create(AEMM.Entity.prototype);
Collection.prototype.constructor = Collection;

Collection.prototype.downloadImages = function(body) {
    var hrefs = [];
    var types = ["thumbnail", "background", "socialSharing"];
    Object.keys(body.schema._links).forEach(function(key){
        if(types.indexOf(key) != -1) {
            hrefs.push(body.schema._links[key].href.match(/contents\/(.*)/)[1]);
            if(body.downSamples && body.schema._links[key].downSamples) {
                body.schema._links[key].downSamples.forEach(function(item){
                    hrefs.push(item.href.match(/contents\/(.*)/)[1]);
                });
            }
        }
    });
    return Promise.all(hrefs.map(function(item){
        var temp = {schema: body.schema, path: item, sessionId: body.sessionId};
        return AEMM.Entity.prototype.requestEntity.call(this, temp);
    })).then(function(result){
        body.images = result;
        return body;
    });
};

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

Collection.prototype.removeEntity = function(body) {
    for(var i=0; i<body.contentElements.length; i++) {
        if(body.contentElements[i].href == body.contentElement.href) {
            body.contentElements.splice(i, 1);
            break;
        }
    }
    return body;
};

Collection.prototype.requestContentElements = function(body) {
    body.options = {
        hostname: AEMM.endPoints.producer,
        path: body.schema._links.contentElements.href,
        method: "GET"
    };
    return AEMM.httpObject.request(body).then(function(contentElements){
        body.contentElements = contentElements;
        return body;
    });
};

Collection.prototype.updateContentElements = function(body) {
    var temp = {
        schema: body.contentElements.map(function(item){return {href: item.href.split(";version=")[0]}}),
        options: {
            hostname: AEMM.endPoints.producer,
            path: body.schema._links.contentElements.href,
            method: "PUT"
        },
        sessionId: body.sessionId
    };
    return AEMM.httpObject.request(temp).then(function(schema){
        body.schema = schema;
        return body;
    });
};

Collection.TYPE = "collection";

AEMM.Collection = Collection;
