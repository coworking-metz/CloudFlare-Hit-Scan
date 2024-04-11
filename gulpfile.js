const gulp = require('gulp');
const concat = require('gulp-concat');
const tap = require('gulp-tap');
const fs = require('fs');
const path = require('path');

gulp.task('scripts', function() {
    const jsFiles = ['./js/main.js', './js/*.js'];
    return gulp.src(jsFiles.filter((item, index) => jsFiles.indexOf(item) === index))
    .pipe(concat('all.js'))
    .pipe(tap(function(file) {
        // Wrap the file contents in an IIFE
        file.contents = Buffer.from(`(function() {\n${file.contents.toString()}\n})();`);
    }))
    .pipe(concat('cf.js')) // Rename the file to cf.js
    .pipe(gulp.dest('./dist/')); // Output to the dist folder
    
    exports.default = scripts;
});
