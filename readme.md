Summary
===

This project provides tools to build a web project as a SPA
or with classic static files.

It is a bundle of famous tools such as :
* [babel](https://babeljs.io/)
* [browser-sync](https://www.browsersync.io/)
* [browserify](http://browserify.org/)
* [minify](https://www.npmjs.com/package/minify)
* [SASS](http://sass-lang.com/)

Installation
====

```
npm install --save-dev rauricoste-web-builder
```

Usage
===

* `node ./node_modules/rauricoste-web-builder/bin/reactWatch.js <my config>.json` :
builds your project and then starts a static server 
using browser-sync. Your files are watched and your
browser reloads when they change.

* `node ./node_modules/rauricoste-web-builder/bin/reactBuild.js <my config>.json` :
builds your project ready for production. The difference with
the previous build is that files are minified.

Configuration
===

As seen in previous section "Usage", you have to provide a config
file. This file is designed to be simple as possible.
The drawback is that this tool cannot be customized much.

Exemple :
```js
{
  // destination folder where the files will be built
  "dist": "dist",  
  // list of modules you want to build
  "modules": {
    // module name. You can put whatever you want here
    "spa-app": {
      // root directory of your module. All paths in this module
      // will start from this root.
      "src": "src/main",
      // indicates that you want to use brwserify for this module.
      "browserify": {
        // entry file for browserify. The full path will
        // then be :
        // "src/main/core/App.js"
        "entry": "core/App.js",
        // output file for browserify (in the dist directory)
        // full path will be : "dist/js/App.js"
        "output": "js/App.js"
      },
      // indicates that you want to use SASS
      "sass": {
        // entry file for SASS
        "entry": "style/app.scss",
        // output file for SASS (dist directory)
        "output": "css/app.css"
      },
      // if true, this module's files will be watched for changes
      // and the browser will reload if a change is detected.
      "watch": true
    },
    "home": {
      "src": "src/main",
      "sass": {
        "entry": "style/home.scss",
        "output": "css/home.css"
      },
      // indicates that you want all files with these extensions
      // to be copied into the "dist" directory
      "assets": ["eot", "svg", "ttf", "woff", "woff2", "mp4", "jpg", "png", "gif"],
      "watch": true
    },
    "htmlTemplates": {
      "src": "src/templates",
      // indicates that you want to use the template system
      "template": {
        // entry files for the template system
        "roots": [
          "faq-candidat.html",
          "faq-recruteur.html"
        ],
        // output directory (relative to the "dist" directory)
        "output": "."
      },
      "watch": true
    },
    "libs": {
      "src": "src/lib",
      // indicates that you want your ".js" files to be copied to
      // the "dist" directory
      "assets": ["js"],
      "watch": false
    }
  }
}
```

Template system
=====

It is a simple template system that lets you build
files using the ES6 feature [String interpolation](http://es6-features.org/#StringInterpolation)

A `template(template file name, properties)` function is provided
to be able to build components.

Exemple :

`home.html`
```html
<html>
${template("head.html", {
    title: "This is my title",
    cssFilename: "home.css"
})}
</html>
<body>
</body>
```

`head.html`
```html
<head>
    <title>${props.title}</title>
    <link rel="stylesheet" type="text/css" href="css/${props.cssFilename}">
</head>
```

When configurating the system with `home.html` as a root template file,
it will generate the following file :
```html
<html>
<head>
    <title>This is my title</title>
    <link rel="stylesheet" type="text/css" href="css/home.css">
</head>
<body>
</body>
</html>
```
