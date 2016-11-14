#!/usr/bin/env node

require("./configPromise").then(function(config) {
    require("../main").build(config);
}).catch(function(err) {
    console.error(err);
})