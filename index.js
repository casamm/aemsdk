module.exports = require('./lib/aem');

/*
    Session Id, philosophy etc.

    Image Thumbnail and Sealing UploadId

    create()
    .uploadImage() //generate uploadId
    .update()
    .seal()
 */

/*
Notes:
update changes version
seal changes version and contentVersion (contentUrl)

/*
Deployment
1) credentials.json
2) Charles Proxy (authentication, remote)
3) markdown
 */

/*
Here is some pointer for you on the last case I have logged against the last of the 5 questions batch ( #2) - > create zip files using HTML assets:
    In order to create a an .article file using a given folder with assets, you’ll need to:
    a- create a manifest.xml in the root of the folder containing all assets
b- zip the contents of the folder ( see if this helps your cause: https://www.npmjs.com/package/node-zip )
    c- rename the .zip in .article
You can rename a .article into a .zip one and see the contents so you can imagine what you need to do. Open the manifest.xml file to see what you need for nodes and attributes.

    So, the most problematic is point a). I have searched some helping info on this adapted for your solution:
    you’ll need to iterate through the contents of all files from a specific folder at a precise location. You can use this as helping documentation: https://www.npmjs.com/package/directory-tree OR https://www.npmjs.com/package/walk (I like the second one more)
    In same time as getting the file names, you can also get their specs:
    Size,
        Mime type (http://stackoverflow.com/questions/10431845/node-js-file-system-get-file-type see this helper)
Name (https://www.npmjs.com/package/walk this is why I like it more)
md5 transformation of file content
Here is a solution I worked out for you:
var fs = require('fs');
var crypto = require('crypto');
var fd = fs.createReadStream(‘full/path/to/file’);      —> you can get it from https://www.npmjs.com/package/walk as root + fileStats.name)
    var hash = crypto.createHash('md5’);
hash.setEncoding('base64');
fd.pipe(hash);
fd.on('end', function() {
    hash.end();
    var rez = hash.read(); // the desired sha1sum
    console.log(rez);
});

Save the manifest.xml in the root folder and archive all content (like select all contents of the root folder and archive them).

Rename to .article and upload.
    Again, look at a regular .article archive content so you can figure out what you must do.

 http://stackoverflow.com/questions/5754153/zip-archives-in-node-js

 http://serverfault.com/questions/39071/does-windows-have-a-built-in-zip-command-for-the-command-line
 http://superuser.com/questions/110991/can-you-zip-a-file-from-the-command-prompt-using-only-windows-built-in-capabili

 http://serverfault.com/questions/147902/windows-command-line-built-in-compression-extraction-tool?rq=1
    */

/*


 function iterate(directory) {
 return new Promise(function(resolve, reject){
 var files = [];
 fs.readdir(directory, function(error, list){
 if(error) {
 reject(error)
 } else {
 list.forEach(function(file){
 file = path.resolve(directory, file);
 fs.stat(file, function(error, stat){
 if(error) {
 reject(error);
 } else {
 if(stat.isDirectory()) {
 iterate(file).then(function(result){
 files.push(result);
 if(files.length == list.length) resolve(files);
 });
 } else {
 files.push(file);
 if(files.length == list.length) resolve(files);
 }
 }
 });
 });
 }
 });
 });
 }
 */