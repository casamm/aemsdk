var AEM = require('../aem');

function Product() {}

/**
 * Create (or update) the product or product bundle.
 * @param body
 * @returns {*}
 */
Product.prototype.create = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.product,
        path: '/applications/' + body.publicationId + '/' + body.entityType + 's/' + body.schema.id,
        method: 'PUT'
    };
    return AEM.remote.request(body).then(function(data){
        body.schema = data;
        return body;
    });
};

/**
 * Update the product or product bundle
 * @param body
 */
Product.prototype.update = function(body) {
    return Product.prototype.create.call(this, body);
};

/**
 * Delete the product or product bundle.
 * @param body
 * @returns {Promise}
 */
Product.prototype.delete = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.product,
        path: '/applications/' + body.publicationId + '/' + body.entityType + 's/' + body.schema.id,
        method: 'DELETE'
    };
    return AEM.remote.request(body).then(function(data){
        return body; //for chain
    });
};

/**
 * Get the product or product bundle metadata.
 * @param body
 * @returns {Promise}
 */
Product.prototype.requestMetadata = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.product,
        path: '/applications/' + body.publicationId + '/' + body.entityType + 's/' + body.schema.id,
        method: 'GET'
    };
    return AEM.remote.request(body).then(function(data){
        body.schema = data;
        return body;
    });
};

/**
 * Get a list of products or product bundles.
 * @param body
 * @returns {Promise}
 */
Product.prototype.requestList = function(body) {
    body.options = {
        hostname: AEM.config.endPoints.product,
        path: '/applications/' + body.publicationId + '/' + body.entityType + 's',
        method: 'GET'
    };
    return AEM.remote.request(body).then(function(data){
        body[body.entityType + 's'] = data;
        return body;
    });
};

Product.TYPE = "product";

AEM.Product = Product;

require('./Bundle');

