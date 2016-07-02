var AEM = require('./aem');

var Authorization = (function(){

    const remote = new AEM.Remote();

    /**
     * Authorization class constructor
     * @constructor
     */
    function Authorization() {}

    /**
     * Get the list of user permissions.
     * @returns {Promise} @resolve permission list @reject credentials or connection errors
     */
    Authorization.prototype.requestPermissions = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.authorization,
            path: '/permissions',
            method: 'GET'
        };

        return remote.request(body).then(function(data){
            body.client = data;
            return body;
        });
    };

    /**
     * Verify that the user is provisioned for the specified publication.
     * Check if the specified publication is within the user permissions.
     * @param body
     * @returns {*} body with list of permissions for the specified publication.
     */
    Authorization.prototype.verifyPermissions = function(body) {
        var accounts = body.client.masters;
        body.permissions = [];
        for(var i=0; i<accounts.length; i++) { //iterate the list of accounts
            for(var j=0; j<accounts[i].publications.length; j++) { //iterate the list of publications per account
                if(accounts[i].publications[j].id == body.entity.publicationId) { //return account or publication permissions
                    body.permissions = accounts[i].permissions.length ? accounts[i].permissions : accounts[i].publications[j].permissions;
                    return body;
                }
            }
        }
        return body;
    };

    /**
     * Verify that the necessary roles are available.
     * Recommended to be used prior to an API request.
     * Compare the list of given roles with the permissions.
     * @param body
     * @returns {*} body with list of missing permissions
     */
    Authorization.prototype.verifyRoles = function(body) {
        for(var i=0; i<body.permissions.length; i++) {
            if(body.permissions[i] == 'master_admin') { // check if master account
                body.roles = []; // no need to check if the user is a "master_admin"
                return body;
            } else {
                var j = body.roles.length;
                while(j--) {
                    if(body.permissions[i] == body.roles[j]) {
                        body.roles.splice(j, 1);
                    }
                }
            }
        }
        return body;
    };

    /**
     * Helper function to verify roles against permissions
     * @param roles
     * @param body
     * @returns {Promise}
     */
    Authorization.prototype.verify = function(body) {
        return this.requestPermissions(body)
            .then(this.verifyPermissions)
            .then(this.verifyRoles)
            .then(function(data){
                if(data.roles.length == 0) {
                    return body;
                } else {
                    throw new Error('Missing the following permissions: ' + JSON.stringify(data.roles));
                }
            })
    };

    return Authorization;

}());

AEM.Authorization = Authorization;