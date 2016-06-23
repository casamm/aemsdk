describe('Layout', function() {

    var assert = require('assert');
    var AEM = require("../../lib/aem");
    var credentials = require('../lib/credentials.json');
    var aem;
    var layout;

    before(function() {
        aem = new AEM(credentials);
        layout = new AEM.Layout("b5bacc1e-7b55-4263-97a5-ca7015e367e0", "defaultLayout");
    });

    describe('#layout()', function () {
        it('should be instantiated', function () {
            assert.ok(layout, 'constructor test');
        });
    });

    describe('#requestDetail()', function () {
        it('should return details', function (done) {
            layout.requestDetail().then(function(data){
                assert.ok(data, "details test");
                assert.ok(data.entityName == 'defaultLayout');
                done();
            }, function(error){
                console.log(error)
            });
        });
    });

    after(function(){
        aem = null;
        layout = null;
    });

});