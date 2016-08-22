#!/usr/bin/env node

var watch = require("watch");
var configHelper = require("./ConfigHelper")(config);
var modules = configHelper.getModules();

var Files = require("./Files");
var BuilderCopy = require("./BuilderCopy");
var BuilderBrowserify = require("./BuilderBrowserify");
var buildTask = require("./build");

var buildInc = function(module, filename) {
    if (Files.isRegularFile(filename)) {
        var extension = Files.getExtension(filename);
        switch(extension) {
            case "js":
                BuilderBrowserify(module);
                break;
            case "css":
            case "html":
                var file = new File(filename);
                BuilderCopy(module, file);
                break;
            default:
                break;
        }
    }
}


module.exports = function(config) {
    buildTask(config);
    modules.forEach(function(module) {
        if (module.watch) {
            console.log("module", module.name, ": watching dir", module.src);
            watch.watchTree(module.src, {interval: 200}, function (file, curr, prev) {
                if (typeof file == "object" && prev === null && curr === null) {
    //                console.log("walked done");
                } else if (prev === null) {
                    console.log("new file", file);
                } else if (curr.nlink === 0) {
                    console.log("file deleted", file);
                } else {
                    console.log("file changed", file);
                    buildInc(module, file);
                }
            });
        }
    });
}
