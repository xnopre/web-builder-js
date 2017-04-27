#!/usr/bin/env node

var Q = require("rauricoste-promise-light");
var File = require("rauricoste-file");
var watch = require("watch");

var Files = require("./Files");
var BuilderCopy = require("./BuilderCopy");
var BuilderBrowserify = require("./BuilderBrowserify");
var BuilderConcat = require("./BuilderConcat");
var BuilderSass = require("./BuilderSass");

var buildTask = require("./build");
var serveTask = require("./serve");

var buildInc = function(module, filename) {
    if (Files.isRegularFile(filename)) {
        var extension = Files.getExtension(filename);
        switch(extension) {
            case "js":
                return BuilderBrowserify(module).then(function() {
                    return BuilderConcat(extension)(module);
                });
                break;
            case "scss":
                return BuilderSass(module);
            default:
                return BuilderConcat(extension)(module).then(function() {
                    if (module.assets && module.assets.indexOf(extension) !== -1) {
                        return BuilderCopy(module, new File(filename)).then(() => {
                            return true;
                        });
                    }
                });
                break;
        }
    } else {
        return Q.empty();
    }
}

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
                    var fileTreated = false
                    Q.traverse(watchedModules, function(module) {
                        if (!fileTreated && file.startsWith(module.src)) {
                            return buildInc(module, file).then(result => {
                                if (result) {
                                    fileTreated = true;
                                }
                            });
                        }
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
