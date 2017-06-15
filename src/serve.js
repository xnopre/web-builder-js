var static = require('node-static');
var Q = require("rauricoste-promise-light");


var uniqsBy = function(objects, fonction) {
    var result = [];
    var values = [];
    objects.forEach(function(object) {
        var value = fonction(object);
        if (values.indexOf(value) === -1) {
            values.push(value);
            result.push(object);
        }
    });
    return result;
}

module.exports = function(config) {
    var browserSync = require("browser-sync").create();
    browserSync.init({
        server: config.dist,
        host: "*"
    })
    return Q.value(browserSync);
}
