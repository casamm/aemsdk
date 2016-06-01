var Authentication = require("../authenticationService/Authentication");

/**
 * Authorization class constructor
 * @constructor
 */
var Authorization = function(credentials, authentication, session) {
    Authentication.call(this, credentials);
    this.authentication = authentication;
    this.session = session;
};

Authorization.prototype = Object.create(Authentication.prototype);
Authorization.prototype.constructor = Authorization;

/**
 * Verify that the user is provisioned for the specified publication.
 * Check if the specified publication is within the user permissions.
 * @param publicationId
 * @returns {Promise}
 */
Authorization.prototype.requestPermissions = function(publicationId) {
    var self = this;
    return new Promise(function(resolve, reject){

        const https = require('https');

        var path = '/permissions';

        var options = {
            hostname: require('../configuration/end-points.json').authorization,
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'x-dps-client-version': self.credentials.clientVersion,
                'x-dps-client-request-id': self.session.requestId,
                'x-dps-client-session-id': self.session.sessionId,
                'x-dps-api-Key': self.credentials.clientId,
                'Authorization': self.authentication.token_type + ' ' + self.authentication.access_token
            }
        };

        var request = https.request(options, function(response) {

            var data = "";
            response.on('data', function(d) {
                data += d;
            });
            
            response.on('end', function(){
                var masters = JSON.parse(data).masters;
                for(var i=0; i<masters.length; i++) {
                    for(var j=0; j<masters[i].publications.length; j++) {
                        if(masters[i].publications[j].id == publicationId) {
                            resolve(masters[i].publications[j].permissions.length ? masters[i].publications[j].permissions : masters[i].permissions);
                        }
                    }
                }
                resolve([]);
            });
        });

        request.on('error', function(error) {
            reject(error);
        });

        request.end();

    });
};

/**
 * Verify that the necessary roles are available.
 * Recommended to be used prior to an API request.
 * Compare the list of given roles with the permissions.
 * @param roles
 * @param permissions
 * @returns {ArrayBuffer|Buffer|string|Array.<T>|Blob} List of missing roles
 */
Authorization.prototype.verifyRoles = function(roles, permissions) {
    var temp = roles.slice();
    for(var i=0; i<roles.length; i++) {
        for(j=0; j<permissions.length; j++) {
            if(roles[i] == permissions[j]) {
                temp.splice(temp.indexOf(roles[i]), 1);
                break;
            }
        }
    }
    return temp;
};

Authorization.prototype.authentication = null;

Authorization.prototype.session = null;

module.exports = Authorization;