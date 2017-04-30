var TemplateTranspiler = require("./TemplateTranspiler");

describe("TemplateTranspiler", () => {
    describe("interpret method", () => {
        it("should transpile @{} into ${includeTemplate()}", () => {
            expect(TemplateTranspiler.interpret(
                `<div>\${title}</div>
                @{"plop.html", {
                    array: [],
                    subObject: {}
                }}
                <div>\${anotherTitle}</div>`
            )).to.deep.equal({
                deps: ["plop.html"],
                content:
                `<div>\${title}</div>
                \${includeTemplate("plop.html", {
                    array: [],
                    subObject: {}
                })}
                <div>\${anotherTitle}</div>`
            })
        })
    })
})