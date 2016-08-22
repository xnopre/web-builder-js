module.exports = function(config) {
    return {
        getModules: function() {
            return Object.keys(config.modules).map(function(moduleName) {
                var module = config.modules[moduleName];
                module.name = moduleName;
                return module;
            });
        }
    }
}