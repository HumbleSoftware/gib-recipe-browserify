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
var uglify     = require('gulp-uglify');
var watchify   = require('watchify');
var _          = require('lodash');

// Exports:
module.exports  = {
  jsTask: jsTask
}

function jsTask (options) {

  options = config(options);

  var b = watchify(browserify(options.browserify));
  var gulp = null;

  // Browserify setup:
  b.transform(babelify, { presets: ['es2015'] });
  b.on('log', gulpUtil.log);

  // Watching:
  b.on('update', bundle);

  // Task:
  function bundle () {

    var dest     = path.dirname(options.dest);
    var filename = path.basename(options.dest);

    gulp = gulp || this;

    return b
      .bundle()
      .pipe(source(filename))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
      .on('error', gulpUtil.log)
      // browserSync.notify(err.message, 3000); ?
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(dest))
      // Reload browser:
      .pipe(options.browserSync.stream());
  };
  return bundle;
}

function config (options) {

  // Defaults:
  options            = options            || {};
  options.reload     = options.reload     || function () {};
  options.dest       = options.dest       || './build/app.js';
  options.src        = options.src        || './src/index.js';
  options.browserify = _.assign(options.browserify || {
    debug: true,
    entries: [
      options.src
    ]
  }, watchify.args);

  return options;
}
