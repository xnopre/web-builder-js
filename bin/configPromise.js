var args = process.argv;
if (args.length !== 3) {
    console.log("args", args);
    throw new Error("usage: <command> <config file>")
}
var configFileName = args[2];
console.log("loading config", configFileName);
var File = require("rauricoste-file");
var file = new File(configFileName);
var promise = file.exists().then(function(exists) {
    if (!exists) {
        throw new Error("file "+configFileName+" does not exists");
    }
    return file.read().then(function(content) {
        return JSON.parse(content);
    });
})

module.exports = promise;
