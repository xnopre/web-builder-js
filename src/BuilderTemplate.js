var Promises = require("rauricoste-promise-light");
var File = require("rauricoste-file");
var TemplateComponentBuilder = require("./TemplateComponentBuilder");

module.exports = function(module, filename) {
    if (!(module.template && module.template.roots && module.template.output)) {
        return Promise.resolve();
    }
    console.log("building module", module.name, ": Template");
    var outputDir = new File(module.dist+"/"+module.template.output);
    return outputDir.mkdirs().then(function() {
        var roots = module.template.roots;
        var filteredRoots = roots;
        if (filename) {
            filteredRoots = roots.filter(root => {
                return filename.endsWith(root);
            });
            filteredRoots = filteredRoots.length ? filteredRoots : roots;
        }
        var builder = new TemplateComponentBuilder(templateName => {
            return new File(module.src+"/"+templateName).read();
        });
        return Promises.traverse(filteredRoots, root => {
            var rootFile = new File(module.src+"/"+root);
            var outputFile = outputDir.child(root);
            console.log(rootFile.path, " => ", outputFile.path);
            return builder.build(root).then(jsContent => {
                return outputDir.child(root+".template.js").write(jsContent).then(() => {
                    return jsContent;
                })
            }).then(jsContent => {
                try {
                    var htmlResult = eval(jsContent);
                    return htmlResult;
                } catch(err) {
                    return new File("template-error.js").write(jsContent).then(() => {
                        throw err;
                    })
                }
            }).then(html => {
                return outputFile.write(html);
            })
        })
    });
}