#!/usr/bin/env node

var BuilderBrowserify = require("./BuilderBrowserify");
var BuilderAssets = require("./BuilderAssets");
var BuilderCopy = require("./BuilderCopy");

module.exports = function(config) {
    var configHelper = require("./ConfigHelper")(config);
    var modules = configHelper.getModules();
    modules.forEach(BuilderBrowserify);
    ["css", "html"].forEach(function(extension) {
        modules.forEach(BuilderAssets(extension));
    })
}
