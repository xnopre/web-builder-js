module.exports = {
    dist: "dist",
    modules: {
        main: {
            src: "test",
            browserify: {
                entry: "index.js",
                output: "bundle.js"
            },
            sass: {
                entry: "main.scss",
                output: "bundle-sass.css"
            },
            concat: {
                css: "bundle.css"
            },
            assets: ["txt", "html"],
            watch: true
        },
        main2: {
            src: "test",
            browserify: {
                entry: "index.js",
                output: "bundle.js"
            },
            watch: true
        },
        templateTest: {
            src: "test/templates",
            template: {
                roots: ["root.html"],
                output: "template"
            }
        }
    },
}