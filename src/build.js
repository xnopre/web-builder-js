#!/usr/bin/env node

var BuilderBrowserify = require("./BuilderBrowserify");
var BuilderAssets = require("./BuilderAssets");
var BuilderConcat = require("./BuilderConcat");
var BuilderCopy = require("./BuilderCopy");
var BuilderSass = require("./BuilderSass");
var File = require("rauricoste-file");
var Q = require("rauricoste-promise-light");

module.exports = function(config) {
    var configHelper = require("./ConfigHelper")(config);
    var modules = configHelper.getModules();

    return Q.all(modules.map(function(module) {
        return new File(module.dist).mkdirs();
    })).then(function() {
        return Q.traverse(modules, function(module) {
            return BuilderBrowserify(module).then(function() {
                return BuilderAssets("html")(module);
            }).then(function() {
                return Q.traverse(Object.keys(module.concat || {}), function(extension) {
                    return BuilderConcat(extension)(module);
                })
            }).then(function() {
                return BuilderSass(module);
            })
        })
    })
}
