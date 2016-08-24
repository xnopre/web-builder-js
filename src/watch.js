#!/usr/bin/env node

var File = require("rauricoste-file");
var watch = require("watch");

var Files = require("./Files");
var BuilderCopy = require("./BuilderCopy");
var BuilderBrowserify = require("./BuilderBrowserify");
var buildTask = require("./build");
var serveTask = require("./serve");

var buildInc = function(module, filename) {
    if (Files.isRegularFile(filename)) {
        var extension = Files.getExtension(filename);
        switch(extension) {
            case "js":
                BuilderBrowserify(module);
                break;
            case "css":
            case "html":
                BuilderCopy(module, new File(filename));
                break;
            default:
                break;
        }
    }
}


module.exports = function(config) {
    var configHelper = require("./ConfigHelper")(config);
    var modules = configHelper.getModules();

    buildTask(config).then(function() {
        modules.forEach(function(module) {
            if (module.watch) {
                console.log("module", module.name, ": watching dir", module.src);
                watch.watchTree(module.src, {interval: 200}, function (file, curr, prev) {
                    if (typeof file == "object" && prev === null && curr === null) {
        //                console.log("walked done");
                    } else if (prev === null) {
                        console.log("new file", file);
                        buildInc(module, file);
                    } else if (curr.nlink === 0) {
                        console.log("file deleted", file);
                        buildInc(module, file);
                    } else {
                        console.log("file changed", file);
                        buildInc(module, file);
                    }
                });
            }
        });
    }).then(function() {
        return serveTask(config);
    })
}
