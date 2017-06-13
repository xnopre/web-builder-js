#!/usr/bin/env node

require("./configPromise").then(function(config) {
    require("../main").build(config, false);
}).catch(function(err) {
    console.error(err);
})