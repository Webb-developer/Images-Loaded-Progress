const { src, dest, parallel } = require("gulp");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const sass = require("gulp-sass");

sass.compiler = require("node-sass");

function js() {
  return src("src/images-loaded-progress.js")
    .pipe(uglify())
    .pipe(rename({ extname: "-min.js" }))
    .pipe(dest("dist/"));
}

function css() {
  return src("src/images-loaded-progress.scss")
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(rename({ extname: ".css" }))
    .pipe(dest("dist/"));
}

exports.default = parallel(css, js);
