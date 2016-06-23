var AEM = require("../aem");

var Layout = (function(){

    var _entityName = null;

    /**
     * Layout class constructor
     * @param publicationID
     * @param entityName
     * @constructor
     */
    function Layout(publicationID, entityName) {
        if(publicationID && entityName) {
            AEM.Entity.call(this, publicationID, Layout.TYPE);
            _entityName = entityName;
        } else {
            throw Error('publication and/or name undefined');
        }
    }

    Layout.prototype = Object.create(AEM.Entity.prototype);
    Layout.prototype.constructor = Layout;

    Layout.prototype.requestDetail = function() {
        return AEM.Entity.prototype.requestDetail.call(this, _entityName);
    };

    Layout.TYPE = "layout";

    return Layout;

})();

AEM.Layout = Layout;