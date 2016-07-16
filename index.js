/**
 * Browserify recipe.
 *
 * TODO multiple entries/exits?
 */
'use strict';

// Modules:
var babelify   = require('babelify');
var browserify = require('browserify');
var sourcemaps = require('gulp-sourcemaps');
var uglify     = require('gulp-uglify');
var gulpUtil   = require('gulp-util');
var path       = require('path');
var buffer     = require('vinyl-buffer');
var source     = require('vinyl-source-stream');
var watchify   = require('watchify');

// Locals:
var bus = null;

// Exports:
module.exports  = {
  browserifyTask: jsTask,
  jsTask: jsTask,
  register: register
};

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
    var bundle   = b.bundle();


    gulp = gulp || this;


    if (bus && bus.error) bundle.on('error', bus.error);


    bundle = bundle
      .pipe(source(filename))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(dest));


    // Reload browser:
    if (options.refreshStream) {
      bundle = bundle.pipe(options.refreshStream());
    } else if (bus && bus.refreshStream) {
      bundle = bundle.pipe(bus.refreshStream());
    }

    return bundle;
  };
  return bundle;
}

function config (options) {

  // Defaults:
  options            = options            || {};
  options.reload     = options.reload     || function () {};
  options.dest       = options.dest       || './build/app.js';
  options.src        = options.src        || './src/index.js';
  options.browserify = Object.assign(options.browserify || {
    debug: true,
    entries: [
      options.src
    ]
  }, watchify.args);

  return options;
}

function register (b) {
  bus = b;
}
