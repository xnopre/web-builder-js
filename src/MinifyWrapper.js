var minify = require("minify");
var File = require("rauricoste-file");

var minifyFct = function(inputFilename) {
    return new Promise((resolve, reject) => {
        minify(inputFilename, function(error, data) {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    })
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
