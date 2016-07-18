var AEMM = require('./aemm');

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
        hostname: AEMM.endPoints.authorization,
        path: '/permissions',
        method: 'GET'
    };
    return AEMM.httpObject.request(body).then(function(data){
        body.subscriber = data;
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
    var accounts = body.subscriber.masters;
    body.authorizations = [];
    for(var i=0; i<accounts.length; i++) { //iteratedir the list of accounts
        for(var j=0; j<accounts[i].publications.length; j++) { //iteratedir the list of publications per account
            if(accounts[i].publications[j].id == body.schema.publicationId) { //return account or publication permissions
                body.authorizations = accounts[i].permissions.length ? accounts[i].permissions : accounts[i].publications[j].permissions;
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
    for(var i=0; i<body.authorizations.length; i++) {
        if(body.authorizations[i] == 'master_admin') { // check if master account
            body.permissions = []; // no need to check if the user is a "master_admin"
            return body;
        } else {
            var j = body.permissions.length;
            while(j--) {
                if(body.authorizations[i] == body.permissions[j]) {
                    body.permissions.splice(j, 1);
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
            if(data.permissions.length == 0) {
                delete body.subscriber;
                delete body.authorizations;
                return body;
            } else {
                throw new Error('Missing the following permissions: ' + JSON.stringify(data.permissions));
            }
        })
};

// Administration
Authorization.PUBLICATION_ADMIN = 'publication_admin';

// Application Development
Authorization.APPBUILDER = 'appbuilder';

// Content
Authorization.PRODUCER_CONTENT_ADD = 'producer_content_add';
Authorization.PRODUCER_CONTENT_DELETE = 'producer_content_delete';
Authorization.PRODUCER_CONTENT_VIEW = 'producer_content_view';
Authorization.PRODUCER_CONTENT_PUBLISH = 'producer_content_publish';
Authorization.PRODUCER_LAYOUT_ADD = 'producer_layout_add';
Authorization.PRODUCER_LAYOUT_DELETE = 'producer_layout_delete';
Authorization.PRODUCER_LAYOUT_VIEW = 'producer_layout_view';
Authorization.PRODUCER_LAYOUT_PUBLISH = 'producer_layout_publish';
Authorization.PRODUCER_PREVIEW = 'producer_preview';

// Notifications
Authorization.NOTIFICATIONS_SEND_TEXT = 'notifications_send_text';
Authorization.NOTIFICATIONS_SEND_BACKGROUND = 'notifications_send_background';
Authorization.NOTIFICATIONS_CERTIFICIATE_ADMIN = 'notifications_certificate_admin';
Authorization.NOTIFICATIONS_VIEW_HISTORY = 'notifications_view_history';

// Products & Subscriptions
Authorization.PRODUCT_VIEW = 'product_view';
Authorization.PRODUCT_ADD = 'product_add';

AEMM.Authorization = Authorization;