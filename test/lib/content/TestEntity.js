describe('Entity', function() {

    var assert = require('assert');
    var AEMM = require("../../../lib/aemm");
    var entity = new AEMM.Entity();

    var body = {
        schema: {
            entityType: AEMM.Entity.TYPE,
            publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0"
        }
    };

    it('should be instantiated', function () {
        assert.ok(entity, "constructor test");
    });

    it('#requestList Layout', function (done) {
        body.schema.entityType = AEMM.Layout.TYPE;

        entity.requestList(body)
            .then(function(data){
                assert.ok(data);
                done();
            })
            .catch(console.log);
    });


    it("should match", function(){
        //var url = "/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/article/sharpsophisticated;version=1466021484411";
        //var url = "/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/article/summer-blockbuster-hits-and-misses;version=1465578384050";
        //var url = "/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/article/story;version=1465576330644";
        var url = "/publication/b5bacc1e-7b55-4263-97a5-ca7015e367e0/article/TestArticleZoom;version=1465576330617";
        var matches = url.match(/\/([article|banner|cardTemplate|collection|font|layout|publication]*)\/([a-zA-Z0-9\_\-\.]*)\;version/);
        console.log(matches);
    });


});