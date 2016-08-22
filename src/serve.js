var static = require('node-static');
var Q = require("rauricoste-promise-light");
var http = require('http');

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
    var configHelper = require("./ConfigHelper")(config);
    var modules = configHelper.getModules();

    var startingPort = config.port || 8000;
    var props = modules.map(function(module, index) {
        var port = startingPort + index;
        return {
            port: port,
            dist: module.dist
        }
    })
    var finalProps = uniqsBy(props, function(prop) {
        return prop.dist;
    })
    return Q.traverse(finalProps, function(props) {
        console.log("starting server for dir", props.dist, "on port", props.port);
        var file = new static.Server(props.dist);
        http.createServer(function (request, response) {
            request.addListener('end', function () {
                file.serve(request, response);
            }).resume();
        }).listen(props.port);
        return Q.value();
    });
}
