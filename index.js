/**
 * Browserify recipe.
 *
 * TODO multiple entries/exits?
 * TODO remove default es2015 transform
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

  var b = browserify(options.src, options.browserify);
  var gulp = null;

  // Watching:
  if (process.env.NODE_ENV !== 'production') {
    b = watchify(b);
  }
  b.on('update', bundle);

  // Wire up logging:
  if (bus) {
    b.on('log', bus.log);
  }

  // Wire up require:
  if (options.require) {
    b.require(options.require)
  }

  // Task:
  function bundle () {

    var dest     = path.dirname(options.dest);
    var filename = path.basename(options.dest);
    var bundle   = b.bundle();

    gulp = gulp || this;

    // Wire up errors:
    function error (e) {
      var error = e.message;
      if (bus) {
        bus.error.call(this, (options.gibTaskName || pkg.name), error);
      } else {
        console.log(error);
        this.emit('end');
      }
    }
    bundle.on('error', error);

    // Bundle source:
    bundle = bundle
      .pipe(source(filename))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}));

    // Uglify:
    // Maybe this condition should be injected?
    if (process.env.NODE_ENV === 'production') {
      bundle = bundle.pipe(uglify());
    }

    // Destination:
    bundle = bundle
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
  options.browserify = Object.assign({
    transform: [babelify.configure({ presets: ['es2015'] })],
    debug: true
  }, watchify.args, options.browserify || {});

  return options;
}

function register (b) {
  bus = b;
}
