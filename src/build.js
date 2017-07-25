#!/usr/bin/env node

var BuilderBrowserify = require("./BuilderBrowserify");
var BuilderAssets = require("./BuilderAssets");
var BuilderConcat = require("./BuilderConcat");
var BuilderSass = require("./BuilderSass");
var BuilderTemplate = require("./BuilderTemplate");
var File = require("rauricoste-file");
var Promises = require("rauricoste-promise-light");

module.exports = function(config, isProd) {
    var configHelper = require("./ConfigHelper")(config);
    var modules = configHelper.getModules(isProd);

    return Promise.all(modules.map(function(module) {
        return new File(module.dist).mkdirs();
    })).then(function() {
        return Promises.traverse(modules, function(module) {
            return BuilderBrowserify(module).then(function() {
                return Promises.traverse(module.assets, function(extension) {
                    return BuilderAssets(extension)(module);
                })
            }).then(function() {
                return Promises.traverse(Object.keys(module.concat || {}), function(extension) {
                    return BuilderConcat(extension)(module);
                })
            }).then(function() {
                return BuilderSass(module);
            }).then(() => {
                return BuilderTemplate(module);
            })
        })
    })
}
