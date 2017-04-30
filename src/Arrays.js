module.exports = {
    toSet: function(array) {
        var result = [];
        array.forEach(item => {
            if (result.indexOf(item) === -1) {
                result.push(item);
            }
        })
        return result;
    }
}