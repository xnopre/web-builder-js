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
            assets: ["txt"],
            watch: true
        },
        main2: {
            src: "test",
            browserify: {
                entry: "index.js",
                output: "bundle.js"
            },
            watch: true
        }
    },
}