#!/usr/bin/env node

var fs = require("fs");
var browserify = require("browserify");
var Q = require("rauricoste-promise-light");

var buildJs = function(module) {
    console.log("building module", module.name, ": JS");
    var entry = module.src+"/"+module.browserify.entry;
    var output = module.dist+"/"+module.browserify.output;
    console.log("Browserify", entry, " => ", output);

    browserify(entry, {debug: true})
      .transform("babelify")
      .bundle()
      .pipe(fs.createWriteStream(output))
    return Q.empty();
}

module.exports = buildJs;