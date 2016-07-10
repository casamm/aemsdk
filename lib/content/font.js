var AEM = require('../aem');

function Font() {
    AEM.Entity.call(this);
}

Font.prototype = Object.create(AEM.Entity.prototype);
Font.prototype.constructor = Font;

Font.prototype.uploadFont = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.producer,
        path: body.schema._links.contentUrl.href + "fonts/" + body.file.type,
        method: "PUT",
        headers: {
            "content-type": AEM.config.mimeTypes.octetstream
        }
    };
    return AEM.remote.request(body).then(function(entity){
        body.schema._links[body.file.type + "Font"] = {href: "contents/fonts/" + body.file.type};
        return body;
    });
};

Font.prototype.enableDesktopWebViewer = function(body) {
    return AEM.Entity.prototype.publish.call(this, body);
};

Font.prototype.disableDesktopWebViewer = function(body) {
    return AEM.Entity.prototype.unpublish.call(this, body);
};

Font.TYPE = 'font';

AEM.Font = Font;