var sass = require('node-sass');
var File = require("rauricoste-file");

module.exports = function(module, sourceMapEmbed) {
    if (!(module.sass && module.sass.entry && module.sass.output)) {
        return Promise.resolve();
    }
    console.log("building module", module.name, ": SASS");
    var inputFile = new File(module.src+"/"+module.sass.entry);
    var outputFile = new File(module.dist+"/"+module.sass.output);
    return outputFile.parent().mkdirs().then(function() {
        return new Promise((resolve, reject) => {
            sass.render({
                file: inputFile.path,
                outputStyle: "nested",
                sourceMapEmbed: sourceMapEmbed
            }, function(err, result) {
                if (err) {
                    reject(err);
                    return;
                }
                var cssContent = result.css.toString();
                outputFile.write(cssContent).then(function() {
                    resolve();
                }).catch(function(err) {
                    reject(err);
                });
            })
        })
    });
}