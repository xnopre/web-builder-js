#!/usr/bin/env node

var BuilderBrowserify = require("./BuilderBrowserify");
var BuilderAssets = require("./BuilderAssets");
var BuilderConcat = require("./BuilderConcat");
var BuilderSass = require("./BuilderSass");
var BuilderTemplate = require("./BuilderTemplate");
var File = require("rauricoste-file");
var PromisesTraverse = require("rauricoste-promise-traverse");

module.exports = function(config, isProd) {
    var configHelper = require("./ConfigHelper")(config);
    var modules = configHelper.getModules(isProd);

    return Promise.all(modules.map(function(module) {
        return new File(module.dist).mkdirs();
    })).then(function() {
        return PromisesTraverse(modules, function(module) {
            return BuilderBrowserify(module).then(function() {
                return PromisesTraverse(module.assets, function(extension) {
                    return BuilderAssets(extension)(module);
                })
            }).then(function() {
                return PromisesTraverse(Object.keys(module.concat || {}), function(extension) {
                    return BuilderConcat(extension)(module);
                })
            }).then(function() {
                return BuilderSass(module, false);
            }).then(() => {
                return BuilderTemplate(module);
            })
        })
    })
}
