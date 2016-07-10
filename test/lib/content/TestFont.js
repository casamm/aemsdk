var assert = require('assert');
var AEM = require("../../../lib/aem");
AEM.config.credentials = require('../credentials.json');
var font = new AEM.Font();

describe("#Font()", function(){
    it("should construct", function(){
        assert.ok(font);
    });
});

describe("#requestList", function(){
    it("should requestList", function(done){
        var body = {
            schema: {
                entityType: AEM.Font.TYPE,
                publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0"
            }
        };
        font.requestList(body)
            .then(function(data){
                assert.ok(data);
                done();
            })
            .catch(console.error);
    });
});

describe('#requestMetadata, uploadFont, publish, unpublish, delete', function(){

    it("should uploadFont, publish, unpublish and delete", function(done){
        this.timeout(0);
        var path = require("path");
        var body = {
            schema: {
                entityName: "adobe",
                title: "adobe",
                postscriptName: "adobe", //filename
                entityType: AEM.Font.TYPE,
                publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0"
            },
            file: {
                path: path.join(__dirname, "../resources/fonts/adobe.otf"), type: "device"
            }
        };

        font.create(body)
            .then(font.uploadFont)
            .then(function(result){
                result.file = {path: path.join(__dirname, "../resources/fonts/adobe.woff"), type: "web"};
                return result;
            })
            .then(font.uploadFont)
            .then(font.update)
            .then(font.seal)
            .then(font.enableDesktopWebViewer)
            .then(function(result){
                return new Promise(function(resolve, reject){
                    var id = setInterval(function(){
                        font.requestStatus(result).then(function(result){
                            switch(result.status[0].eventType) {
                                case "progress": break;
                                case "success": clearInterval(id); resolve(result); break;
                                case "failure": clearInterval(id); reject(result.status[0]); break;
                            }
                        });
                    }, 1000);
                });
            })
            .then(function(result){ // disableDesktopWebViewer
                return new Promise(function(resolve, reject){
                    var id = setInterval(function(){
                        font.disableDesktopWebViewer(result).then(function(){clearInterval(id); resolve(result)})
                    }, 1000);
                });
            })
            .then(function(result){
                return new Promise(function(resolve, reject){
                    var id = setInterval(function(){
                        font.delete(result).then(function(){clearInterval(id); resolve()});
                    }, 1000);
                });
            })
            .then(done)
            .catch(console.error);
    });
});