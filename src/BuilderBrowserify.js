#!/usr/bin/env node

var fs = require("fs");
var browserify = require("browserify");
var Q = require("rauricoste-promise-light");
var babelify = require("babelify");
var File = require("rauricoste-file");
var MinifyWrapper = require("./MinifyWrapper");

var buildJs = function(module) {
    if (!(module.browserify && module.browserify.entry && module.browserify.output)) {
        return Q.empty();
    }
    console.log("building module", module.name, ": JS");
    var entry = module.src+"/"+module.browserify.entry;
    var output = module.dist+"/"+module.browserify.output;
    console.log("Browserify", entry, " => ", output);

    return new File(output).parent().mkdirs().then(function() {
        var defer = Q.defer();
        var writeStream = fs.createWriteStream(output);
        writeStream.on("close", function() {
            defer.resolve();
        })
        browserify(entry, {debug: true})
          .transform(babelify, {
            presets: ["es2015", "react"].map(function(presetName) {
                return require("babel-preset-"+presetName);
            })
          })
          .bundle(function(err, buf) {
            if (err) {
                defer.reject(err);
            }
          })
          .pipe(writeStream)
        return defer.promise;
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