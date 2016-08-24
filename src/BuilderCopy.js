var File = require("rauricoste-file");

module.exports = function(module, file) {
    var srcDir = new File(module.src);
    var relativeFile = file.getRelativeFile(srcDir);
    var dest = new File(module.dist+"/"+relativeFile.path);
    var srcFile = srcDir.child(relativeFile.path);
    console.log("Copy", file.path, " => ", dest.path);
    return srcFile.exists().then(function(exists) {
        if (exists) {
            return dest.parent().mkdirs().then(function() {
                return file.copy(dest);
            })
        } else {
            return dest.delete();
        }
    })
}