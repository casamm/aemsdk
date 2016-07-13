var assert = require('assert');
var AEM = require("../../../lib/aem");
var font = new AEM.Font();

var path = require("path");

describe("#Font()", function(){

    it("should construct", function(){
        assert.ok(font);
    });

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

    it("should uploadFonts, publish, unpublish and delete", function(done){
        this.timeout(0);
        var datum = {
            schema: {
                entityName: "font",
                title: "font title",
                postscriptName: "font.otf",
                entityType: AEM.Font.TYPE,
                publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0"
            },
            fonts: [
                {path: path.join(__dirname, "../resources/font/font.otf"), type: "device"},
                {path: path.join(__dirname, "../resources/font/font.woff"), type: "web"}
            ]
        };

        font.create(datum)
            .then(font.uploadFonts)
            .then(font.update)
            .then(font.seal)
            .then(font.enableDesktopWebViewer)
            .then(font.addWorkflowObserver)
            .then(font.disableDesktopWebViewer)
            .then(font.addWorkflowObserver)
            .then(font.delete)
            .then(function(data){
                done();
            })
            .catch(console.error);
    });
});