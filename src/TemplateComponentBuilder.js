var Arrays = require("./Arrays");
var Q = require("rauricoste-promise-light");

var encapsulate = function(jsContentArray) {
    return ["(function() {"].concat(jsContentArray).concat(["})();"]);
}

var TemplateComponentBuilder = function(templateLoader) {
    this.templateLoader = templateLoader;
    this.cachedTemplates = {};
}
TemplateComponentBuilder.prototype.getTemplate = function(templateName) {
    var cachedTemplate = this.cachedTemplates[templateName];
    if (cachedTemplate) {
        return Q.value(cachedTemplate);
    }
    return this.templateLoader(templateName).then(content => {
        this.cachedTemplates[templateName] = content;
        return content;
    })
}
TemplateComponentBuilder.prototype.getAllDeps = function(templateName) {
    return this.getTemplate(templateName).then(templateContent => {
        var jsContent = encapsulate([
            "var templateDeps = [];",
            "var template = function(name) { templateDeps.push(name); };",
            "var props = {};",
            "`"+templateContent+"`",
            "return templateDeps;"
        ]).join("\n");
        var deps = eval(jsContent);
        var result = deps;
        return Q.traverse(deps, dep => {
            return this.getAllDeps(dep).then(subDeps => {
                result = result.concat(subDeps);
            })
        }).then(() => {
            return Arrays.toSet(result);
        })
    })
}
TemplateComponentBuilder.prototype.getTemplateFct = function(templateName) {
    return this.getTemplate(templateName).then(template => {
        return "templates[\""+templateName+"\"] = function(props) { return `"+template+"` };";
    });
}
TemplateComponentBuilder.prototype.build = function(templateName) {
    return this.getAllDeps(templateName).then(deps => {
        return Q.traverse([templateName].concat(deps).reverse(), dep => {
            return this.getTemplateFct(dep);
        }).then(templateFcts => {
            var jsContent = encapsulate([
                "var templates = {};",
                "var template = "+includeTemplateString+";",
            ].concat(templateFcts).concat([
                "return template(\""+templateName+"\");"
            ])).join("\n");
            return jsContent;
        })
    })
}

var templates = {};
var includeTemplate = function(templateName, props) {
    props = props || {};
    if (typeof props !== "object") {
        throw new Error("expected an object or nothing but got "+props);
    }
    var template = templates[templateName];
    if (!template) {
        throw new Error("template "+templateName+" was not found");
    }
    return template(props);
}
var includeTemplateString = includeTemplate.toString();

module.exports = TemplateComponentBuilder;
