/**
 * Browserify recipe.
 *
 * TODO multiple entries/exits?
 */
'use strict';

// Modules:
var babelify   = require('babelify');
var browserify = require('browserify');
var buffer     = require('vinyl-buffer');
var gulpUtil   = require('gulp-util');
var path       = require('path');
var sourcemaps = require('gulp-sourcemaps');
var source     = require('vinyl-source-stream');
var uglify     = require('gulp-uglify')

// Exports:
module.exports  = {
  jsTask: jsTask
}

function jsTask (options) {

  options = config(options);

  // Task:
  return function () {

    var gulp     = this;
    var dest     = path.dirname(options.dest);
    var filename = path.basename(options.dest);
    var b        = browserify(options.browserify);

    return b
      .transform(babelify, { presets: ['es2015'] })
      .bundle()
      .pipe(source(filename))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
      .on('error', gulpUtil.log)
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(dest));
  };
}

function config (options) {

  // Defaults:
  options            = options            || {};
  options.dest       = options.dest       || './build/app.js';
  options.src        = options.src        || './src/index.js';
  options.browserify = options.browserify || {
    debug: true,
    entries: [
      options.src
    ]
  };

  return options;
}
