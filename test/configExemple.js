module.exports = {
    dist: "dist",
    modules: {
        main: {
            src: "test",
            browserify: {
                entry: "index.js",
                output: "bundle.js"
            },
            concat: {
                css: "bundle.css"
            },
            watch: true
        }
    },
}