module.exports = function(config) {
    return {
        getModules: function() {
            return Object.keys(config.modules).map(function(moduleName) {
                var module = config.modules[moduleName];
                module.name = moduleName;
                module.dist = module.dist || config.dist;
                module.assets = module.assets || ["html"];
                return module;
            });
        }
    }
}