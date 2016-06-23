var AEM = require('../aem');

var Entity = (function(){

    var _publicationId = null;
    var _type = null;

    /**
     * Entity constructor
     * @param type
     * @param name
     * @constructor
     */
    function Entity(publicationId, type) {
        if(publicationId && type) {
            _publicationId = publicationId;
            _type = type;
        } else {
            throw Error('publicationId, type and name required');
        }
    }

    Entity.TYPE = 'entity';

    /**
     * Request for a list of entities of the same entity type.
     * The list (pageSize) is limited to 25 entities, unless otherwise specified.
     * @returns {Promise}
     */
    Entity.prototype.requestList = function() {
        return new Promise(function(resolve, reject){
            AEM.authentication.getToken().then(function(authentication){
                var options = {
                    hostname: require('../configuration/end-points.json').producer,
                    port: 443,
                    path: '/publication/' + _publicationId + '/' + _type,
                    method: 'GET',
                    headers: {}
                };

                var remote = new AEM.Remote();
                remote.request(options).then(function(data){resolve(data)}, function(error){reject(error)});

            }, function(error){
                reject(error);
            });
        });
    };

    Entity.prototype.requestDetail = function(name) {
        if(typeof name == undefined) Error('name undefined');
        return new Promise(function(resolve, reject){
            var options = {
                hostname: require('../configuration/end-points.json').producer,
                port: 443,
                path: '/publication/' + _publicationId + '/' + _type + '/' + name,
                method: 'GET',
                headers: {}
            };

            var remote = new AEM.Remote();
            remote.request(options).then(function(data){resolve(data)}, function(error){reject(error)});
        });
    };

    return Entity;
})();

AEM.Entity = Entity;

require('./article');
require('./collection');
require('./layout');