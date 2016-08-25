#!/usr/bin/env node

var fs = require("fs");
var browserify = require("browserify");
var Q = require("rauricoste-promise-light");

var buildJs = function(module) {
    console.log("building module", module.name, ": JS");
    var entry = module.src+"/"+module.browserify.entry;
    var output = module.dist+"/"+module.browserify.output;
    console.log("Browserify", entry, " => ", output);

    var defer = Q.defer();
    var writeStream = fs.createWriteStream(output);
    writeStream.on("close", function() {
        defer.resolve();
    })
    browserify(entry, {debug: true})
      .transform("babelify")
      .bundle(function(err, buf) {
        if (err) {
            defer.reject(err);
        }
      })
      .pipe(writeStream)
    return defer.promise;
}

module.exports = buildJs;