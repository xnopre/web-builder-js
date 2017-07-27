#!/usr/bin/env node

require("./configPromise").then(function(config) {
    return require("../main").build(config, false);
}).catch(function(err) {
    console.error(err);
})