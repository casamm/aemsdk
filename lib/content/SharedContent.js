var AEMM = require("../aemm");

/**
 * SharedContent class constructor
 * @constructor
 */
function SharedContent() {}

SharedContent.prototype = Object.create(AEMM.Entity.prototype);
SharedContent.prototype.constructor = SharedContent;

SharedContent.prototype.requestSharedContent = function(body) {
    return AEMM.Entity.prototype.requestEntity.call(this, body);
};

SharedContent.prototype.uploadSharedContent = function(body) {
    body.uploadId = body.uploadId || AEMM.genUUID();
    return Promise.all(body.sharedContents.map(function(sharedContent){
        var temp = {schema: body.schema, upload: sharedContent, uploadId: body.uploadId};
        return AEMM.Entity.prototype.uploadFile.call(null, temp).then(function(meta){
            return meta;
        });
    })).then(function(){
        return body;
    });
};

SharedContent.TYPE = "SharedContent";

AEMM.SharedContent = SharedContent;