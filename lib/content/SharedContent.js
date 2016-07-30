var AEMM = require("../aemm");

var path = require('path');

/**
 * SharedContent class constructor
 * @constructor
 */
function SharedContent() {}

SharedContent.prototype = Object.create(AEMM.Entity.prototype);
SharedContent.prototype.constructor = SharedContent;

SharedContent.prototype.requestSharedContent = function(body) {
    return AEMM.Entity.prototype.requestEntity.call(this, body).then(function(result){
        body.contentUrl = result;
        return body;
    });
};

SharedContent.prototype.uploadSharedContent = function(body) {
    body.uploadId = body.uploadId || AEMM.genUUID();
    return Promise.all(body.sharedContents.map(function(sharedContent){
        var temp = {schema: body.schema, upload: sharedContent, uploadId: body.uploadId, sessionId: body.sessionId};
        return AEMM.Entity.prototype.uploadFile.call(null, temp).then(function(meta){
            return meta;
        });
    })).then(function(){
        return body;
    });
};

SharedContent.listdir = function(dir) {
    return AEMM.listdir(dir)
        .then(function(data){
            var parent = path.join(dir, "../");
            return data.map(function(file){
                return {file: file, path: path.relative(parent, file)};
            });
        });
};

SharedContent.TYPE = "SharedContent";

AEMM.SharedContent = SharedContent;
