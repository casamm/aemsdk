/**
 * User class constructor
 * @constructor
 */
var User = function() {};

/**
 * Helper.
 * Generate an alphanumeric (a-f) value of a given length.
 * Used to generate each section of the client-side UUID.
 * @param length The length of the alphanumeric value
 * @returns {string} The alphanumeric value of the given length
 */
User.prototype.genId = function(length) {
    for(var i=0, id=''; i<length; i++) {
        if(Math.round(Math.random())) { // generate a random letter, 0 or 1
            id += String.fromCharCode(Math.floor((Math.random() * 5) + 1) + 97);
        } else {
            id += Math.floor((Math.random() * 5) + 1);
        }
    }
    return id;
};

/**
 * Helper
 * Generate the UUID (alphanumeric).
 * @returns {string} The UUID of the following length: 8-4-4-4-12
 */
User.prototype.genUUID = function() {
    var low = this.genId(8);
    var mid = this.genId(4);
    var high = this.genId(4);
    var seq = this.genId(4);
    var node = this.genId(12);
    var uuid = low + "-" + mid + "-" + high + "-" + seq + "-" + node;
    return uuid;
};

module.exports = new User();