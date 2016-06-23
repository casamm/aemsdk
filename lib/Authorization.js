var AEM = require('./aem');

var Authorization = (function(){

    var _data = null;
    var _permissions = null;

    /**
     * Authorization class constructor
     * @constructor
     */
    function Authorization() {
    }

    /**
     * Get the list of user permissions.
     * @param requestId
     * @param sessionId
     * @returns {Promise}
     */
    Authorization.prototype.requestPermissions = function() {
        return new Promise(function(resolve, reject){
            var options = {
                hostname: require('./configuration/end-points.json').authorization,
                port: 443,
                path: '/permissions',
                method: 'GET'
            };
            var remote = new AEM.Remote();
            remote.request(options).then(function(data){
                _data = data;
                resolve(data)
            }, function(error){
                console.log('e', error);
                reject(error)
            });
        });
    };

    /**
     * Verify that the user is provisioned for the specified publication.
     * Check if the specified publication is within the user permissions.
     * Store the list of permissions for the specified publication.
     * @param publicationId
     * @returns {*}
     */
    Authorization.prototype.verifyPermissions = function(publicationId) {
        for(var i=0; i<_data.masters.length; i++) {
            for(var j=0; j<_data.masters[i].publications.length; j++) {
                if(_data.masters[i].publications[j].id == publicationId) {
                    _permissions = _data.masters[i].publications[j].permissions.length ? _data.masters[i].publications[j].permissions : _data.masters[i].permissions;
                    return _permissions;
                }
            }
        }
        _permissions = [];
        return _permissions;
    };

    /**
     * Verify that the necessary roles are available.
     * Recommended to be used prior to an API request.
     * Compare the list of given roles with the permissions.
     * @param roles
     * @returns {ArrayBuffer|Buffer|String|Array.<T>|Blob} List of missing roles
     */
    Authorization.prototype.verifyRoles = function(roles) {
        var temp = roles.slice();
        for(var i=0; i<roles.length; i++) {
            for(j=0; j<_permissions.length; j++) {
                if(roles[i] == _permissions[j]) {
                    temp.splice(temp.indexOf(roles[i]), 1);
                    break;
                }
            }
        }
        return temp;
    };

    return Authorization;
})();

AEM.Authorization = Authorization;