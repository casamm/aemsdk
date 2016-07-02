describe('Layout', function() {

    var assert = require('assert');
    var AEM = require("../../lib/aem");
    var credentials = require('../lib/credentials.json');
    var aem;
    var layout;

    before(function() {
        aem = new AEM();
        layout = new AEM.Layout();
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