module.exports = {
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
            dist: "dist",
            watch: true
        }
    },
}