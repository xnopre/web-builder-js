#!/usr/bin/env node

var fs = require("fs");
var browserify = require("browserify");
var babelify = require("babelify");
var File = require("rauricoste-file");
var MinifyWrapper = require("./MinifyWrapper");

var buildJs = function(module) {
    if (!(module.browserify && module.browserify.entry && module.browserify.output)) {
        return Promise.resolve();
    }
    console.log("building module", module.name, ": JS");
    var entry = module.src+"/"+module.browserify.entry;
    var output = module.dist+"/"+module.browserify.output;
    console.log("Browserify", entry, " => ", output);

    return new File(output).parent().mkdirs().then(function() {
        return new Promise((resolve, reject) => {
            var writeStream = fs.createWriteStream(output);
            writeStream.on("close", function() {
                resolve();
            })
            browserify(entry, {debug: true})
              .transform(babelify, {
                presets: ["es2015", "react"].map(function(presetName) {
                    return require("babel-preset-"+presetName);
                })
              })
              .bundle(function(err, buf) {
                if (err) {
                    reject(err);
                }
              })
              .pipe(writeStream)
        })
    }).then(function() {
        if (module.isProd) {
            var outputMin = output+".min";
            return MinifyWrapper(output, outputMin).then(function() {
                return new File(outputMin).moveTo(new File(output));
            })
        }
    })
}

module.exports = buildJs;