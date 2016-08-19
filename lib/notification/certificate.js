var AEMM = require('../aemm');
var https = require('https');

function Certificate() {}

Certificate.prototype.requestList = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: "GET",
            hostname: 'rps.publish.adobe.io',
            path: "/certificate",
            headers: {
                'Accept': 'application/json;charset=UTF-8',
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': AEMM.authentication.getToken().token_type + ' ' + AEMM.authentication.getToken().access_token,
                'x-tenant-id': data.schema.tenantId,
                'x-notification-client-id': 'pb',
                'x-dps-client-request-id': AEMM.genUUID(),
                'x-dps-client-session-id': data.sessionId || (data.sessionId = AEMM.genUUID()),
                'x-dps-api-key': AEMM.credentials.clientId,
                'x-dps-client-version': AEMM.credentials.clientVersion
            }
        }, function(response){
            var buffers = [];
            response.on('data', function(chunk){buffers.push(chunk)});
            response.on('end', function(){
                var result = JSON.parse(Buffer.concat(buffers).toString());
                response.statusCode == 200 ? resolve(result) : reject(result);
            });
        });
        request.end(JSON.stringify(data.schema));
    })
};

Certificate.prototype.isRevoked = function(data) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'GET',
            hostname: 'rps.publish.adobe.io', hostname: 'localhost', port: 60104,
            path: '/certificate/' + data.schema.os + '/' + data.schema.appId + '/isRevoked',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': AEMM.authentication.getToken().token_type + ' ' + AEMM.authentication.getToken().access_token,
                'x-dps-client-request-id': AEMM.genUUID(),
                'x-dps-client-session-id': data.sessionId || (data.sessionId = AEMM.genUUID()),
                'x-dps-api-key': AEMM.credentials.clientId,
                'x-dps-client-version': AEMM.credentials.clientVersion,
                'x-tenant-id': data.schema.tenantId,
                'x-notification-client-id': 'pb'
            }
        }, function(response){
            var buffers = [];
            response.on('data', function(chunk){buffers.push(chunk)});
            response.on('end', function(){
                var result = JSON.parse(Buffer.concat(buffers).toString());
                response.statusCode == 200 ? resolve(result) : reject(result);
            });
        }).on('error', reject);
        request.end();
    });
};

AEMM.Certificate = Certificate;
