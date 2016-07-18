var assert = require('assert');
var AEMM = require("../../../lib/aemm");
var font = new AEMM.Font();

var fs = require("fs");
var path = require("path");

describe("#Font()", function(){

    it("should construct", function(){
        assert.ok(font);
    });

    it("should requestList", function(done){
        var body = {
            schema: {
                entityType: AEMM.Font.TYPE,
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
                entityName: "fontEntity",
                title: "font title",
                postscriptName: "font.otf",
                entityType: AEMM.Font.TYPE,
                publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0"
            },
            fonts: [
                {path: path.join(__dirname, "../resources/font/font.otf"), subpath: "fonts/device"},
                {path: path.join(__dirname, "../resources/font/font.woff"), subpath: "fonts/web"}
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

    it("should create, upload and download fonts", function(done){
        this.timeout(0);
        var datum = {
            schema: {
                entityName: "fontEntity",
                title: "font title",
                postscriptName: "font.otf",
                entityType: AEMM.Font.TYPE,
                publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0"
            },
            fonts: [
                {path: path.join(__dirname, "../resources/font/font.otf"), subpath: "fonts/device"},
                {path: path.join(__dirname, "../resources/font/font.woff"), subpath: "fonts/web"}
            ]
        };

        font.create(datum)
            .then(font.uploadFonts)
            .then(font.update)
            .then(font.seal)
            .then(font.downloadFonts)
            .then(font.delete)
            .then(function(data){
                assert.ok(data.fonts.length == 2);
                var isDownloaded = false;
                data.fonts.forEach(function(item){
                    isDownloaded = true;
                    assert.ok(fs.existsSync(item));
                    //fs.unlink(item);
                });
                assert.ok(isDownloaded);
                done();
            })
            .catch(console.error);
    });

    it("should match font", function(){
        var urls = [
            "/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/font/fontEntity/contents;contentVersion=1468627103814/fonts/web",
            "/publication/b5baabce-7b55-5563-97a6-ca7235e367e0/font/newFont001/contents;contentVersion=1468627103814/fonts/device"
        ];

        var matches = AEMM.matchContentUrl(urls[0]);
        assert.ok(matches[1] == 'b5bacc1e-7b55-4263-97a5-ca7015e367e0');
        assert.ok(matches[3] == "font");
        assert.ok(matches[4] == 'fontEntity');
        assert.ok(matches[6] == 'web');

        matches = AEMM.matchContentUrl(urls[1]);
        assert.ok(matches[6] == 'device');
    });

});