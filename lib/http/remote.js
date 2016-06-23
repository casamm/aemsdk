var AEM = require("../aem");

var Remote = (function(){

    /**
     * Remote constructor
     * @constructor
     */
    function Remote() {
    }

    Remote.prototype.request = function(options) {
        options = options || {};
        options.headers = options.headers || {};

        return new Promise(function(resolve, reject){

            AEM.authentication.getToken().then(function(data){

                options.headers['x-dps-client-version'] = AEM.config.credentials.clientVersion;
                options.headers['x-dps-api-Key'] = AEM.config.credentials.clientId;
                options.headers['Authorization'] = data.token_type + ' ' + data.access_token;
                options.headers['x-dps-client-request-id'] = AEM.genUUID();
                options.headers['x-dps-client-session-id'] = AEM.genUUID();

                const https = require('https');
                https.request(options, function(response) {
                    var body = [];
                    response.on('data', function(chunk) {
                        body.push(chunk);
                    });
                    response.on('end', function(){
                        var data = JSON.parse(Buffer.concat(body).toString());
                        response.statusCode == 200 ? resolve(data) : reject(data);
                    });
                }).on('error', function(error) {
                    reject(error);
                }).end();

            }, function(error) {
                reject(error);
            });
        });
    };

    return Remote;

})();

AEM.Remote = Remote;