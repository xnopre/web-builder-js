#!/usr/bin/env node

require("./configPromise").then(function(config) {
    return require("../main").watch(config);
}).catch(function(err) {
    console.error(err);
})