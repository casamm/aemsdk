var AEM = require('../aem');

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

/**
 * CardTemplate class constructor
 * @constructor
 */
function Article() {}

Article.prototype = Object.create(AEM.Entity.prototype);
Article.prototype.constructor = Article;

Article.prototype.zip = function(body) {
    return new Promise(function(resolve, reject){
        body.command = '$(which zip) -r ' + body.filename + ' ' + body.folder + ' && ' + 'du -hs ' + body.filename;

        child_process.exec(body.command, {cwd: body.root}, function(error, stdout, stderr){
            error ? reject(error) : (stderr != '' ? reject(stderr) : resolve(stdout.trim()));
        });
    });
};

function iterate(directory) {
    var readdir = function(directory) {
        return new Promise(function(resolve, reject){
            fs.readdir(directory, function(error, list) {error ? reject(error) : resolve(list)});
        });
    };
    
    var stat = function(file) {
        return new Promise(function(resolve, reject){
            fs.stat(file, function(error, stat) {error ? reject(error) : resolve(stat)});
        });
    };

    return readdir(directory)
        .then(function(list){
            return Promise.all(list.map(function(file){
                file = path.resolve(directory, file);
                return stat(file).then(function(stat){return stat.isDirectory() ? iterate(file) : file});
            }));
        })
        .then(function(result){
            return Array.prototype.concat.apply([], result);
        });
}

Article.prototype.iterateArticleDirectory = function(body) {
    return iterate(body.path).then(function(result){
        var i = result.length;
        while(i--) {
            if((/(^|\/)\.[^\/\.]/g).test(result[i])) {
                result.splice(i, 1);
            }
        }
        return result;
    })
};

Article.prototype.requestManifest = function(body) {
    return AEM.Entity.prototype.requestEntity.call(this, body);
};

Article.prototype.uploadArticle = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.ingestion,
        path: '/publication/' + body.schema.publicationId + '/article/' + body.schema.entityName + ';version=' + body.schema.version + '/contents/' + (body.file.type || 'folio'),
        method: 'PUT',
        headers: {
            'content-type': AEM.config.mimeTypes.article,
            'accept': AEM.config.mimeTypes.json
        }
    };
    return AEM.remote.request(body).then(function(result){
        body.workflowId = result.workflowId;
        return body;
    });
};

Article.TYPE = 'article';

AEM.Article = Article;