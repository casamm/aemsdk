var AEM = require('../aem');

var path = require('path');

function Font() {
    AEM.Entity.call(this);
}

Font.prototype = Object.create(AEM.Entity.prototype);
Font.prototype.constructor = Font;

Font.prototype.uploadFont = function(body) {
    body.uploadId = body.uploadId || AEM.genUUID();

    body.options = {
        hostname: AEM.endPoints.producer,
        path: body.schema._links.contentUrl.href + "fonts/" + body.font.type,
        method: "PUT",
        headers: {
            "content-type": AEM.mimetypes.octetstream
        }
    };
    return AEM.remote.request(body).then(function(entity){
        body.schema._links[body.font.type + "Font"] = {href: "contents/fonts/" + body.font.type};
        return body;
    });
};

Font.prototype.uploadFonts = function(body) {
    body.uploadId = body.uploadId || AEM.genUUID();

    return Promise.all(body.fonts.map(function(font){
        var datum = JSON.parse(JSON.stringify(body));

        datum.options = {
            hostname: AEM.endPoints.producer,
            path: datum.schema._links.contentUrl.href + "fonts/" + font.type,
            method: "PUT",
            headers: {
                "content-type": AEM.mimetypes.octetstream
            }
        };
        datum.font = font;
        return AEM.remote.request(datum).then(function(meta){
            return {href: "contents/fonts/" + datum.font.type};
        });
    })).then(function(result){
            for(var i=0; i<result.length; i++) {
                body.schema._links[body.fonts[i].type + "Font"] = result[i];
            }
            return body;
        })
};

Font.prototype.enableDesktopWebViewer = function(body) {
    return AEM.Entity.prototype.publish.call(this, body);
};

Font.prototype.disableDesktopWebViewer = function(body) {
    return AEM.Entity.prototype.unpublish.call(this, body);
};

Font.TYPE = 'font';

AEM.Font = Font;