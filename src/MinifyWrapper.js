var minify = require("minify");
var Q = require("rauricoste-promise-light");
var File = require("rauricoste-file");

var minifyFct = function(inputFilename) {
    var defer = Q.defer();
    minify(inputFilename, function(error, data) {
        if (error) {
            defer.reject(error);
        } else {
            defer.resolve(data);
        }
    });
    return defer.promise;
}

module.exports = function(inputFilename, outputFilename) {
    console.log("minifying", inputFilename);
    return minifyFct(inputFilename).then(function(data) {
        var output = new File(outputFilename);
        return output.parent().mkdirs().then(function() {
            return output.write(data);
        })
    })
}
