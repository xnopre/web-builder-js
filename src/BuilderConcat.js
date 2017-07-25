var Files = require("./Files");
var Promises = require("rauricoste-promise-light");
var File = require("rauricoste-file");

module.exports = function(extension) {
    return function(module) {
        if (!module.concat || !module.concat[extension]) {
            return Promise.resolve();
        }
        console.log("building module", module.name, ":", extension);
        var srcFile = new File(module.src);
        var destFile = new File(module.dist+"/"+module.concat[extension]);
        return srcFile.crawl(function(file) {
            return !file.isFile() || Files.getExtension(file.name()) === extension;
        }).then(function(files) {
            return destFile.delete().catch(function() {}).then(function() {
                return destFile.parent().mkdirs();
            }).then(function() {
                return Promises.traverse(files, function(file) {
                    return file.read().then(function(content) {
                        return destFile.append(content+"\n");
                    })
                }).then(function() {
                    console.log("Concat "+extension+" files to "+destFile.path);
                });
            })
        });
    }
}