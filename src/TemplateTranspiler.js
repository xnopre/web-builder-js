var Arrays = require("./Arrays");

var TemplateTranspiler = function() {
}
TemplateTranspiler.prototype.interpret = function(content) {
    var index = content.indexOf("@{");
    if (index === -1) {
        return {
            content: content,
            deps: []
        }
    } else {
        var start = content.substring(0, index);
        var startBar = content.substring(index + 2);
        var nextIndexArobase = startBar.indexOf("@{");
        var nextIndexDollar = startBar.indexOf("${");
        var nextIndexArr = [nextIndexArobase, nextIndexDollar].filter(index => {
            return index !== -1;
        });
        var nextIndex = nextIndexArr.length ? nextIndexArr.reduce(Math.min) : -1;
        var searchedInside = nextIndex === -1 ? startBar : startBar.substring(0, nextIndex);
        var indexEnd = searchedInside.lastIndexOf("}");
        if (indexEnd === -1) {
            throw new Error("could not find closing } for opening @{ at "+index);
        }
        var inside = searchedInside.substring(0, indexEnd);
        var end = startBar.substring(indexEnd + 1);
        var depName = getDep(inside);
        var interpretedEnd = this.interpret(end);
        return {
            content: start + "${includeTemplate(" + inside + ")}" + interpretedEnd.content,
            deps: Arrays.toSet([depName].concat(interpretedEnd.deps))
        }
    }
}

var getDep = function(inside) {
    var index1 = inside.indexOf("\"");
    var nextString = inside.substring(index1+1);
    var index2 = nextString.indexOf("\"");
    return nextString.substring(0, index2);
};

module.exports = new TemplateTranspiler();