var AEMM = require('../aemm');

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

/**
 * CardTemplate class constructor
 * @constructor
 */
function Article() {}

Article.prototype = Object.create(AEMM.Entity.prototype);
Article.prototype.constructor = Article;

Article.prototype.buildArticle = function(body) { //
    return iterateArticleDirectory(body.article.src)
        .then(function(files){ // create manifest.xml
            if(body.article.generateManifest == undefined || body.article.generateManifest == true) {
                var writeStream = fs.createWriteStream(path.join(body.article.src, "manifest.xml"));
                writeStream.write('  <manifest version="' + (body.article.viewerVersion || '3.0.0') + '" targetViewer="' + (body.article.targetViewer || '33.0.0') + '" dateModified="' + new Date().toISOString() + '">\n');
                if(fs.existsSync(path.join(body.article.src, "index.html"))) { // look for index.html or article.xml in root directory
                    writeStream.write('      <index type="text/html" href="index.html"></index>\n');
                } else if(fs.existsSync(path.join(body.article.src, "article.xml"))) {
                    writeStream.write('      <index type="text/xml" href="article.xml"></index>\n');
                }
                writeStream.write('      <resources>\n');
                files.forEach(function(file){
                    writeStream.write('          <resource type="' + file['type'] + '" href="' + path.relative(body.article.src, file['href']) + '" length="' + file['length'] + '" md5="' + file['md5'] + '"></resource>\n');
                });
                writeStream.write("    </resources>\n");
                writeStream.end("  </manifest>");
            }
        })
        .then(function(){ // create .article
            var folder = path.relative(path.join(body.article.src, "../"), body.article.src);
            var command = '$(which zip) -r ../' + folder + '.article .';
            if(body.article.deleteSourceDir) command += " && rm -rf ../" + folder; // delete source directory
            return execute(command, {cwd: body.article.src})
                .then(function(stdout){
                    if(!body.article.deleteSourceDir && (body.article.generateManifest == undefined || body.article.generateManifest == true)) { // delete manifest
                        fs.unlinkSync(path.join(body.article.src, "manifest.xml"));
                    }
                    body.article.path = path.join(body.article.src, '../', folder + '.article');
                    return body;
                });
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
    return AEMM.listdir(dir)
        .then(function(files){ // excludes hidden, no-extension, manifest.xml, .zip, .article
            var i = files.length;
            while(i--) {
                if((/(^|\/)\.[^\/\.]/g).test(files[i]) || /[^.]+$/.exec(files[i]).index == 0 || path.relative(dir, files[i]).toLowerCase() == "manifest.xml") {
                    files.splice(i, 1);
                    if((/(^|\/)\.[^\/\.]/g).test(files[i])) fs.unlink(files[i]); // delete hidden
                }
            }
            return Promise.all(files.map(function(file){
                return parseFile(file);
            }))
        });
}

function parseFile(file) {
    return new Promise(function(resolve, reject){
        Promise.all([AEMM.md5(file), AEMM.stat(file)]).then(function(result){
            resolve({md5: result[0], type: AEMM.mimetypes[path.extname(file).substr(1)], href: file, length: result[1].size});
        });
    });
}

function execute(command, options) {
    return new Promise(function(resolve, reject){
        child_process.exec(command, options, function(error, stdout, stderr){
            error ? reject(error) : (stderr != '' ? reject(stderr) : resolve(stdout.trim()));
        });
    })
}

Article.TYPE = 'article';

AEMM.Article = Article;