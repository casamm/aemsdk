var AEM = require('../aem');

var Product = (function(){

    function Product() {}

    /**
     * Create (or update) the product or product bundle.
     * @param body
     * @returns {*}
     */
    Product.prototype.create = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.product,
            path: '/applications/' + body.data.publicationId + '/' + body.data.entityType+ '/' + body.data.entityName,
            method: 'GET'
        };
        return AEM.remote.request(body).then(function(data){
            body[body.data.entityType] = data;
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
            path: '/applications/' + body.data.publicationId + '/' + body.data.entityType + 's/' + body.data.entityName,
            method: 'DELETE'
        };
        return AEM.remote.request(body);
    };

    /**
     * Get the product or product bundle metadata.
     * @param body
     * @returns {Promise}
     */
    Product.prototype.requestMetadata = function(body) {
        body.options = {
            hostname: AEM.config.endPoints.product,
            path: '/applications/' + body.data.publicationId + '/' + body.data.entityType + 's/' + body.data.entityName,
            method: 'GET'
        };
        return AEM.remote.request(body).then(function(data){
            body.data = data;
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
            path: '/applications/' + body.data.publicationId + '/' + body.data.entityType + 's',
            method: 'GET'
        };
        return AEM.remote.request(body).then(function(data){
            body[body.data.entityType + 's'] = data;
            return body;
        });
    };

    Product.TYPE = "product";

    return Product;

}());

AEM.Product = Product;

