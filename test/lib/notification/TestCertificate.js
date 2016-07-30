describe("Certificate", function(){

    var assert = require('assert');
    var AEMM = require("../../../lib/aemm");
    var certificate = new AEMM.Certificate();

    var body = {
        schema: {
            entityType: AEMM.Entity.TYPE,
            publicationId: "b5bacc1e-7b55-4263-97a5-ca7015e367e0"
        }
    };

    it('should be instantiated', function () {
        assert.ok(certificate, "constructor test");
    });

    it('should requestList', function(done){

        certificate.requestList(body)
            .then(function(result){
                console.log(result);
            }).catch(console.error);

    });

});