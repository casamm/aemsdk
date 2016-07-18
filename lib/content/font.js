var AEMM = require('../aemm');

var path = require('path');

function Font() {
    AEMM.Entity.call(this);
}

Font.prototype = Object.create(AEMM.Entity.prototype);
Font.prototype.constructor = Font;

Font.prototype.uploadFonts = function(body) {
    body.uploadId = body.uploadId || AEMM.genUUID();
    return Promise.all(body.fonts.map(function(font){
        var temp = {schema: body.schema, upload: font, uploadId: body.uploadId};
        return AEMM.Entity.prototype.uploadFile.call(null, temp).then(function(meta){
            return meta || {href: "contents/" + font.subpath.split("/")[1]};
        });
    })).then(function(result){
        for(var i=0; i<result.length; i++) {
            body.schema._links[body.fonts[i].subpath.split("/")[1] + "Font"] = result[i];
        }
        return body;
    });
};

Font.prototype.downloadFonts = function(body) {
    var hrefs = [];
    var types = ["webFont", "deviceFont"];
    Object.keys(body.schema._links).forEach(function(key){
        if(types.indexOf(key) != -1) {
            hrefs.push(body.schema._links[key].href.match(/contents\/(.*)/)[1]);
        }
    });
    return Promise.all(hrefs.map(function(item){
        var temp = {schema: body.schema, subpath: "fonts/" + item};
        return AEMM.Entity.prototype.requestEntity.call(this, temp);
    })).then(function(result){
        body.fonts = [];
        result.forEach(function(item){
            body.fonts.push(item);
        });
        return body;
    });
};

Font.prototype.enableDesktopWebViewer = function(body) {
    return AEMM.Entity.prototype.publish.call(this, body);
};

Font.prototype.disableDesktopWebViewer = function(body) {
    return AEMM.Entity.prototype.unpublish.call(this, body);
};

Font.TYPE = 'font';

AEMM.Font = Font;