var AEM = require("../aem");

var Layout = (function(){

    /**
     * Layout class constructor
     * @constructor
     */
    function Layout() {
    }

    Layout.prototype = Object.create(AEM.Entity.prototype);
    Layout.prototype.constructor = Layout;

    Layout.TYPE = "layout";

    return Layout;

})();

AEM.Layout = Layout;