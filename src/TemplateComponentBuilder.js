var Arrays = require("./Arrays");
var Q = require("rauricoste-promise-light");
var TemplateTranspiler = require("./TemplateTranspiler");

var TemplateComponentBuilder = function(templateLoader) {
    this.templateLoader = templateLoader;
    this.cachedTemplates = {};
    this.cachedInterpretedTemplates = {};
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
TemplateComponentBuilder.prototype.getInterpreted = function(templateName) {
    var cachedInterpreted = this.cachedInterpretedTemplates[templateName];
    if (cachedInterpreted) {
        return Q.value(cachedInterpreted);
    }
    return this.getTemplate(templateName).then(content => {
        var interpreted = TemplateTranspiler.interpret(content);
        this.cachedInterpretedTemplates[templateName] = interpreted;
        return interpreted;
    })
}
TemplateComponentBuilder.prototype.getAllDeps = function(templateName) {
    return this.getInterpreted(templateName).then(interpreted => {
        var deps = interpreted.deps;
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
    return this.getInterpreted(templateName).then(interpreted => {
        return "templates[\""+templateName+"\"] = function(props) { return `"+interpreted.content+"` };";
    });
}
TemplateComponentBuilder.prototype.build = function(templateName) {
    return this.getAllDeps(templateName).then(deps => {
        return Q.traverse([templateName].concat(deps).reverse(), dep => {
            return this.getTemplateFct(dep);
        }).then(templateFcts => {
            var jsContent = "var templates = {};\n";
            jsContent += "var includeTemplate = "+includeTemplateString+";\n";
            jsContent += templateFcts.join("\n")+";\n";
            jsContent += "includeTemplate(\""+templateName+"\");";
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
