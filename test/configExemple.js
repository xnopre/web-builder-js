module.exports = {
    modules: {
        main: {
            src: "test",
            browserify: {
                entry: "index.js",
                output: "bundle.js"
            },
            dist: "dist",
            watch: true
        }
    },
}