var Files = require("./Files");
var Q = require("rauricoste-promise-light");
var File = require("rauricoste-file");

var BuilderCopy = require("./BuilderCopy");

module.exports = function(extension) {
    return function(module) {
        if (!module.assets || module.assets.indexOf(extension) === -1) {
            return Q.empty();
        }
        console.log("building module", module.name, ":", extension);
        var srcFile = new File(module.src);
        return srcFile.crawl(function(file) {
            return !file.isFile() || Files.getExtension(file.name()) === extension;
        }).then(function(files) {
            return Q.traverse(files, function(file) {
                return BuilderCopy(module, file);
            });
        });
    }
}