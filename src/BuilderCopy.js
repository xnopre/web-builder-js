var File = require("rauricoste-file");

module.exports = function(module, file) {
    var srcFile = new File(module.src);
    var dest = new File(module.dist+"/"+file.getRelativeFile(srcFile).path);
    console.log("Copy", file.path, " => ", dest.path);
    return file.copy(dest);
}