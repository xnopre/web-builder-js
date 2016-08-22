module.exports = {
    getExtension: function(filename) {
        var pointIndex = filename.lastIndexOf(".");
        return filename.substring(pointIndex+1);
    },
    isRegularFile: function(filename) {
        return new RegExp("\\.[a-z]+$", "g").test(filename);
    }
}