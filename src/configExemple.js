module.exports = {
    modules: {
        main: {
            src: "src",
            browserify: {
                entry: "index.js",
                output: "bundle.js"
            },
            dist: "dist",
            watch: true
        },
        libs: {
            src: "lib",
            browserify: {
                entry: "node.js",
                output: "libs.js"
            },
            dist: "dist",
            watch: true
        }
    },
}