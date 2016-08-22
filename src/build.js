#!/usr/bin/env node

var BuilderBrowserify = require("./BuilderBrowserify");
var BuilderAssets = require("./BuilderAssets");
var BuilderCopy = require("./BuilderCopy");
var File = require("rauricoste-file");
var Q = require("rauricoste-promise-light");

module.exports = function(config) {
    var configHelper = require("./ConfigHelper")(config);
    var modules = configHelper.getModules();

    Q.all(modules.map(function(module) {
        console.log("mkdir", module.dist);
        return new File(module.dist).mkdir().catch(function() {});
    })).then(function() {
        modules.forEach(BuilderBrowserify);
        ["css", "html"].forEach(function(extension) {
            modules.forEach(BuilderAssets(extension));
        })
    })
}
