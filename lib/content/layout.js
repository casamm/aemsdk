var AEM = require("../aem");

/**
 * Layout class constructor
 * @constructor
 */
function Layout() {}

Layout.prototype = Object.create(AEM.Entity.prototype);
Layout.prototype.constructor = Layout;

Layout.TYPE = "layout";

AEM.Layout = Layout;