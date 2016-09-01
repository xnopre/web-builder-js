var sass = require('node-sass');
var Q = require("rauricoste-promise-light");
var File = require("rauricoste-file");

module.exports = function(module) {
    if (!(module.sass && module.sass.entry && module.sass.output)) {
        return Q.empty();
    }
    console.log("building module", module.name, ": SASS");
    var inputFile = new File(module.src+"/"+module.sass.entry);
    var outputFile = new File(module.dist+"/"+module.sass.output);
    var defer = Q.defer();
    sass.render({
        file: inputFile.path,
        outputStyle: "nested"
    }, function(err, result) {
        if (err) {
            defer.reject(err);
            return;
        }
        var cssContent = result.css.toString();
        outputFile.write(cssContent).then(function() {
            defer.resolve();
        }).catch(function(err) {
            defer.reject(err);
        });
    })
    return defer.promise;
}