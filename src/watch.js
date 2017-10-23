#!/usr/bin/env node

var PromisesTraverse = require("rauricoste-promise-traverse");
var File = require("rauricoste-file");
var watch = require("watch");

var Files = require("./Files");
var BuilderCopy = require("./BuilderCopy");
var BuilderBrowserify = require("./BuilderBrowserify");
var BuilderConcat = require("./BuilderConcat");
var BuilderSass = require("./BuilderSass");
var BuilderTemplate = require("./BuilderTemplate");

var buildTask = require("./build");
var serveTask = require("./serve");

var debouncer = require("./debouncer");

var buildInc = debouncer.debounceByKey(function(module, filename, assetCopied) {
    if (Files.isRegularFile(filename)) {
        var extension = Files.getExtension(filename);
        switch(extension) {
            case "js":
                return BuilderBrowserify(module).then(function() {
                    return BuilderConcat("js")(module);
                });
                break;
            case "scss":
                return BuilderSass(module);
            default:
                return BuilderConcat(extension)(module).then(function() {
                    if (!assetCopied && module.assets && module.assets.indexOf(extension) !== -1) {
                        return BuilderCopy(module, new File(filename)).then(() => {
                            return true;
                        });
                    }
                }).then(result => {
                    return BuilderTemplate(module, filename).then(() => {
                        return result;
                    })
                });
                break;
        }
    } else {
        return Promise.resolve();
    }
}, 500, (module, filename) => {
    var extension = Files.getExtension(filename);
    var key = module.name+"___"+extension;
    return key;
})

var toSet = function(array) {
    var result = [];
    array.forEach(function(item) {
        if (result.indexOf(item) === -1) {
            result.push(item);
        }
    })
    return result;
}

module.exports = function(config) {
    var configHelper = require("./ConfigHelper")(config);
    var modules = configHelper.getModules(false);

    buildTask(config).then(function() {
        return serveTask(config);
    }).then(function(browserSync) {
        var watchedModules = modules.filter(function(module) {
            return module.watch;
        })
        var srcDirs = toSet(watchedModules.map(function(module) {
            return module.src;
        }));
        srcDirs.forEach(function(srcDir) {
            console.log("watching dir", srcDir);
            watch.watchTree(srcDir, {interval: 1}, function (file, curr, prev) {
                if (typeof file == "object" && prev === null && curr === null) {
    //                console.log("walked done");
                } else {
                    if (prev === null) {
                        console.log("new file", file);
                    } else if (curr.nlink === 0) {
                        console.log("file deleted", file);
                    } else {
                        console.log("file changed", file);
                    }
                    var assetCopied = false
                    var moduleBuilt = watchedModules.filter(module => {
                        return module.src === srcDir && file.startsWith(module.src);
                    })
                    PromisesTraverse(moduleBuilt, function(module) {
                        return buildInc(module, file, assetCopied).then(result => {
                            if (result) {
                                assetCopied = true;
                            }
                        });
                    }).then(function() {
                        browserSync.reload();
                    }).catch(function(err) {
                        console.error(err.stack);
                    })
                }
            });
        })
    }).catch(function(err) {
        console.error(err.stack);
    });
}
