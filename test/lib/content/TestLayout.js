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

    after(function(){
        aem = null;
        layout = null;
    });

});