#!/usr/bin/env node

var Q = require("rauricoste-promise-light");
var File = require("rauricoste-file");
var watch = require("watch");

var Files = require("./Files");
var BuilderCopy = require("./BuilderCopy");
var BuilderBrowserify = require("./BuilderBrowserify");
var BuilderConcat = require("./BuilderConcat");
var buildTask = require("./build");
var serveTask = require("./serve");

var buildInc = function(module, filename) {
    if (Files.isRegularFile(filename)) {
        var extension = Files.getExtension(filename);
        switch(extension) {
            case "js":
                return BuilderBrowserify(module);
                break;
            case "css":
                return BuilderConcat(extension)(module);
                break;
            case "html":
                return BuilderCopy(module, new File(filename));
                break;
            default:
                break;
        }
    } else {
        return Q.empty();
    }
}


module.exports = function(config) {
    var configHelper = require("./ConfigHelper")(config);
    var modules = configHelper.getModules();

    buildTask(config).then(function() {
        return serveTask(config);
    }).then(function(browserSync) {
        modules.forEach(function(module) {
            if (module.watch) {
                console.log("module", module.name, ": watching dir", module.src);
                watch.watchTree(module.src, {interval: 200}, function (file, curr, prev) {
                    if (typeof file == "object" && prev === null && curr === null) {
        //                console.log("walked done");
                    } else {
                        var promise;
                        if (prev === null) {
                            console.log("new file", file);
                            promise = buildInc(module, file);
                        } else if (curr.nlink === 0) {
                            console.log("file deleted", file);
                            promise = buildInc(module, file);
                        } else {
                            console.log("file changed", file);
                            promise = buildInc(module, file);
                        }
                        promise.then(function() {
                            browserSync.reload();
                        }).catch(function(err) {
                            console.error(err.stack);
                        })
                    }
                });
            }
        });
    }).catch(function(err) {
        console.error(err.stack);
    });
}
