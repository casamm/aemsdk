var AEMM = require('../aemm');

function Certificate() {}

Certificate.prototype.requestList = function(body) {
    body.options = {
        hostname: AEMM.endPoints.notification,
        path: "/certificate",
        method: "GET",
        headers: {
            'x-tenant-id': AEMM.genUUID(),
            'x-notification-client-id': AEMM.genUUID()
        }
    };
    return AEMM.httpObject.request(body).then(function(result){
        console.log(result);
    });
};

AEMM.Certificate = Certificate;

