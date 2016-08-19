var AEMM = require('../aemm');
var https = require('https');

function Notification() {}

Notification.prototype.create = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'POST',
            hostname: 'rps.publish.adobe.io',
            path: '/notifications',
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
        request.end(JSON.stringify(data.schema.push));
    });
};

Notification.prototype.healthCheck = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'GET',
            hostname: 'rps.publish.adobe.io',
            path: '/healthCheck',
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

Notification.prototype.deviceCount = function(data) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'GET',
            hostname: 'rps.publish.adobe.io', hostname: 'localhost', port: 60104,
            path: '/devices/' + data.schema.os + '/' + data.schema.appId + '/deviceCount' + (data.schema.query || ''),
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

Notification.prototype.requestList = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'GET',
            hostname: 'rps.publish.adobe.io',
            path: '/notifications',
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

Notification.prototype.delete = function(data) {
    return new Promise(function(resolve, reject){
        var request = https.request({
            method: 'DELETE',
            hostname: 'rps.publish.adobe.io',
            path: '/notifications/' + data.schema.notificationId,
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

AEMM.Notification = Notification;
