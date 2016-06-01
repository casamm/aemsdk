/**
 * Entity constructor
 * @constructor
 */
var Entity = function() {};

/**
 * Request for a list of entities of the same entity type.
 * The list (pageSize) is limited to 25 entities, unless otherwise specified.
 * @returns {Proimse}
 */
Entity.prototype.requestList = function(credentials, authentication, publication, entityType) {
    return new Proimse(function(resolve, reject){
        const https = require('https');

        var path = '/permissions';

        var options = {
            hostname: require('../configuration/end-points.json').producer,
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'x-dps-client-version': credentials.clientVersion,
                'x-dps-client-request-id': require("../userService/User").genUUID(),
                'x-dps-client-session-id': require("../userService/User").genUUID(),
                'x-dps-api-Key': credentials.clientId,
                'Authorization': 'Bearer ' + authentication.access_token
            }
        };

        var request = https.request(options, function(response) {
            var data = "";
            response.on('data', function(d) {
                data += d;
            });
            response.on('end', function(){
                resolve(JSON.parse(data));
            });
        });

        request.on('error', function(error) {
            reject(error);
        });

        request.end();
    });
};

module.exports = Entity;