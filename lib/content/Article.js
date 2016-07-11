var AEM = require("../aem");

/**
 * CardTemplate class constructor
 * @constructor
 */
function Article() {}

Article.prototype = Object.create(AEM.Entity.prototype);
Article.prototype.constructor = Article;

function execute(body) {
    return new Promise(function(resolve, reject){
        const exec = require('child_process').exec;
        exec(body.command, {cwd: body.root}, function(error, stdout, stderr){
            if(error) {
                reject(error);
            } else {
                stderr != '' ? reject(stderr) : resolve(stdout.trim());
            }
        });
    });
}

Article.prototype.zip = function(body) {
    body.command = "/usr/bin/zip -r " + body.filename + " " + body.folder + " && " + "du -hs " + body.filename;
    return execute(body);
};

Article.prototype.requestManifest = function(body) {
    return AEM.Entity.prototype.requestEntity.call(this, body);
};

Article.prototype.uploadArticle = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.ingestion,
        path: "/publication/" + body.schema.publicationId + "/article/" + body.schema.entityName + ";version=" + body.schema.version + "/contents/" + (body.file.type || "folio"),
        method: "PUT",
        headers: {
            "content-type": AEM.config.mimeTypes.article,
            "accept": AEM.config.mimeTypes.json
        }
    };
    return AEM.remote.request(body).then(function(result){
        body.workflowId = result.workflowId;
        return body;
    });
};

Article.TYPE = "article";

AEM.Article = Article;