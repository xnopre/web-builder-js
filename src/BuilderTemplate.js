var Q = require("rauricoste-promise-light");
var File = require("rauricoste-file");

var getDep = function(inside) {
    var index1 = inside.indexOf("\"");
    var nextString = inside.substring(index1+1);
    var index2 = nextString.indexOf("\"");
    return nextString.substring(0, index2);
};

var toSet = function(array) {
    var result = [];
    array.forEach(item => {
        if (result.indexOf(item) === -1) {
            result.push(item);
        }
    })
    return result;
};

var interpret = function(content) {
    var index = content.indexOf("@{");
    if (index === -1) {
        return {
            content: content,
            deps: []
        }
    } else {
        var start = content.substring(0, index);
        var startBar = content.substring(index + 2);
        var nextIndexArobase = startBar.indexOf("@{");
        var nextIndexDollar = startBar.indexOf("${");
        var nextIndexArr = [nextIndexArobase, nextIndexDollar].filter(index => {
            return index !== -1;
        });
        var nextIndex = nextIndexArr.length ? nextIndexArr.reduce(Math.min) : -1;
        var searchedInside = nextIndex === -1 ? startBar : startBar.substring(0, nextIndex);
        var indexEnd = searchedInside.lastIndexOf("}");
        if (indexEnd === -1) {
            throw new Error("could not find closing } for opening @{ at "+index);
        }
        var inside = searchedInside.substring(0, indexEnd);
        var end = startBar.substring(indexEnd + 1);
        var depName = getDep(inside);
        var interpretedEnd = interpret(end);
        return {
            content: start + "${includeTemplate(" + inside + ")}" + interpretedEnd.content,
            deps: [depName].concat(interpretedEnd.deps)
        }
    }
}

var templates = {};
var includeTemplate = function(templateName, props) {
    props = props || {};
    if (typeof props !== "object") {
        throw new Error("expected an object or nothing but got "+props);
    }
    return templates[templateName].bind(props)(props);
}

module.exports = function(module, filename) {
    if (!(module.template && module.template.roots && module.template.output)) {
        return Q.empty();
    }
    console.log("building module", module.name, ": Template");
    var outputDir = new File(module.dist+"/"+module.template.output);
    var getTemplateFct = function(file, templateName) {
        return getTemplateFile(file, templateName).then(content => {
            return "templates[\""+templateName+"\"] = function(props) { return `"+interpret(content).content+"` };";
        });
    }
    var cachedFiles = {};
    var getTemplateFile = function(file, templateName) {
        var cachedTemplate = cachedFiles[templateName];
        if (cachedTemplate) {
            return Q.value(cachedTemplate);
        }
        return file.read().then(content => {
            cachedFiles[templateName] = content;
            return content;
        })
    }

    var getAllDeps = function(depName) {
        var depFile = new File(module.src+"/"+depName);
        var result = [];
        return getTemplateFile(depFile, depName).then(content => {
            var interpreted = interpret(content);
            var deps = interpreted.deps;
            result = result.concat(deps);
            return Q.traverse(deps, dep => {
                return getAllDeps(dep).then(subDeps => {
                    result = result.concat(subDeps);
                })
            }).then(() => {
                return result;
            })
        })
    }

    return outputDir.mkdirs().then(function() {
        var roots = module.template.roots;
        if (filename) {
            roots = roots.filter(root => {
                return filename.endsWith(root);
            });
        }
        return Q.traverse(roots, root => {
            var rootFile = new File(module.src+"/"+root);
            var outputFile = outputDir.child(root);
            console.log(rootFile.path, " => ", outputFile.path);
            return getAllDeps(root).then(deps => {
                deps = toSet([root].concat(deps));
                return Q.traverse(deps.reverse(), dep => {
                    var depFile = new File(module.src+"/"+dep);
                    return getTemplateFct(depFile, dep);
                }).then(templateFcts => {
                    var jsContent = "var templates = {};\n";
                    jsContent += "var includeTemplate = "+includeTemplate.toString()+";\n";
                    jsContent += templateFcts.join("\n")+";\n";
                    jsContent += "includeTemplate(\""+root+"\");";
                    try {
                        var htmlResult = eval(jsContent);
                        return htmlResult;
                    } catch(err) {
                        return new File("template-error.js").write(jsContent).then(() => {
                            throw err;
                        })
                    }
                })
            }).then(html => {
                return outputFile.write(html);
            })
        })
    });
}