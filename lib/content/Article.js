var AEMM = require('../aemm');
var assert = require('assert');

var fs = require('fs');
var fsobject = require('../api/fsobject');
var path = require('path');
var child_process = require('child_process');

/**
 * CardTemplate class constructor
 * @constructor
 */
function Article() {}

Article.prototype = Object.create(AEMM.Entity.prototype);
Article.prototype.constructor = Article;

Article.prototype.buildArticle = function(body) {
    return new Promise(function(resolve, reject){

        iterateArticleDirectory(body.article.src)
            .then(function(files){
                return new Promise(function(resolve, reject){
                    if(body.article.generateManifest == undefined || body.article.generateManifest == true) {

                        var writeStream = fs.createWriteStream(path.join(body.article.src, 'manifest.xml'));
                        writeStream.on('error', reject);
                        writeStream.on('drain', function(){console.log('drain', arguments)});
                        writeStream.on('end', function() {console.log("EOF", body.article.src)});
                        writeStream.on('close', resolve);
                        writeStream.on('finish', function(){});

                        writeStream.write('<manifest version="' + (body.article.viewerVersion || '3.0.0') + '" targetViewer="' + (body.article.targetViewer || '33.0.0') + '" dateModified="' + new Date().toISOString() + '">\n');
                        fsobject.stat(path.join(body.article.src, "index.html"))
                            .then(writeStream.write.bind(writeStream, '\t<index type="text/html" href="index.html"></index>\n'))
                            .catch(function(error){
                                return fsobject.stat(path.join(body.article.src, "article.xml"))
                                    .then(function(){writeStream.write('\t<index type="text/xml" href="article.xml"></index>\n')})
                                    .catch(reject);
                            })
                            .then(function(){
                                writeStream.write('\t<resources>\n');
                                files.forEach(function(file){
                                    writeStream.write('\t\t<resource type="' + file['type'] + '" href="' + path.relative(body.article.src, file['href']) + '" length="' + file['length'] + '" md5="' + file['md5'] + '"></resource>\n');
                                });
                                writeStream.end("\t</resources>\n</manifest>");
                            });
                    }
                });
            })
            .then(function(){
                var folder = path.relative(path.join(body.article.src, "../"), body.article.src);
                var command = 'zip -FSr ../' + folder + '.article .';
                if(body.article.deleteSourceDir) command += " && rm -rf ../" + folder; // delete source directory
                return execute(command, {cwd: body.article.src, maxBuffer: 1024 * 500});
            })
            .then(function(stdout){
                if(!body.article.deleteSourceDir && (body.article.generateManifest == undefined || body.article.generateManifest == true)) { // delete manifest
                    fsobject.unlink(path.join(body.article.src, "manifest.xml"));
                }
                body.article.path = path.join(body.article.src, '../', path.relative(path.join(body.article.src, "../"), body.article.src) + '.article');
                resolve(body);
            })
            .catch(reject);
    });
};

Article.prototype.requestManifest = function(body) {
    return AEMM.Entity.prototype.requestEntity.call(this, body).then(function(result){
        body['contentUrl'] = result;
        return body;
    });
};

Article.prototype.uploadArticle = function(body) {
    body.options = {
        hostname: AEMM.endPoints.ingestion,
        path: '/publication/' + body.schema.publicationId + '/article/' + body.schema.entityName + ';version=' + body.schema.version + '/contents/' + (body.article.rendition || 'folio'),
        method: 'PUT',
        headers: {
            'content-type': AEMM.mimetypes.article,
            'accept': AEMM.mimetypes.json
        }
    };
    body.upload = {file: body.article.path};
    return AEMM.httpObject.request(body).then(function(result){
        body.aspect = "ingestion";
        body.workflowId = result.workflowId;
        return body;
    });
};

Article.prototype.linkSharedContent = function(body) {
    body.uploadId = body.uploadId || AEMM.genUUID();
    var temp = {
        schema: body.sharedContent,
        options: {
            hostname: AEMM.endPoints.producer,
            path: body.schema._links.contentUrl.href + AEMM.matchContentUrl(body.sharedContent.href)[4],
            method: 'PUT',
            headers: {
                'content-type': AEMM.mimetypes.symlink,
                'accept': AEMM.mimetypes.json,
                'x-dps-upload-id': body.uploadId
            }
        }
    };
    return AEMM.httpObject.request(temp).then(function(result){
        return body;
    });
};

function iterateArticleDirectory(dir) {
    return fsobject.listdir(dir)
        .then(function(files){ // excludes hidden, no-extension, user provided manifest.xml, .zip, .article
            var i = files.length;
            while(i--) {
                if((/(^|\/)\.[^\/\.]/g).test(files[i]) || /[^.]+$/.exec(files[i]).index == 0 || path.relative(dir, files[i]).toLowerCase() == "manifest.xml") {
                    files.splice(i, 1);
                    if((/(^|\/)\.[^\/\.]/g).test(files[i])) fs.unlink(files[i]); // delete hidden
                }
            }
            return Promise.all(files.map(function(file){
                return parseFile(file);
            }));
        });
}

function parseFile(file) {
    return new Promise(function(resolve, reject){
        Promise.all([fsobject.md5(file), fsobject.stat(file)]).then(function(result){
            resolve({md5: result[0], type: AEMM.mimetypes[path.extname(file).substr(1)], href: file, length: result[1].size});
        });
    });
}

function execute(command, options) {
    return new Promise(function(resolve, reject){
        child_process.exec(command, options, function(error, stdout, stderr){
            error ? reject(error) : (stderr != '' ? reject(stderr) : resolve(stdout.trim()));
        });
    });
}

Article.TYPE = 'article';

AEMM.Article = Article;


