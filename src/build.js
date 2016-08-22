#!/usr/bin/env node

var BuilderBrowserify = require("./BuilderBrowserify");
var BuilderAssets = require("./BuilderAssets");
var BuilderCopy = require("./BuilderCopy");
var File = require("rauricoste-file");
var Q = require("rauricoste-promise-light");

module.exports = function(config) {
    var configHelper = require("./ConfigHelper")(config);
    var modules = configHelper.getModules();

    return Q.all(modules.map(function(module) {
        console.log("mkdir", module.dist);
        return new File(module.dist).mkdir().catch(function() {});
    })).then(function() {
        return Q.traverse(modules, function(module) {
            return BuilderBrowserify(module).then(function() {
                return Q.traverse(["css", "html"], function(extension) {
                    return BuilderAssets(extension)(module);
                })
            })
        })
    })
}
