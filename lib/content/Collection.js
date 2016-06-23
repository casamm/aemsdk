var AEM = require("../aem");

var Collection = (function(){

    var _entityName = null;

    /**
     * Collection constructor
     * @param publicationID
     * @param name
     * @constructor
     */
    function Collection(publicationID, entityName) {
        if(publicationID && entityName) {
            AEM.Entity.call(this, publicationID, Collection.TYPE);
            _entityName = entityName;
        } else {
            throw Error('publication and/or name undefined');
        }
    }

    Collection.prototype = Object.create(AEM.Entity.prototype);
    Collection.prototype.constructor = Collection;

    Collection.prototype.requestDetail = function() {
        return AEM.Entity.prototype.requestDetail.call(this, _entityName);
    };

    Collection.TYPE = "collection";

    return Collection;

})();

AEM.Collection = Collection;