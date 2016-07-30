var expect    = require('chai').expect;
var fs        = require('fs');
var gulp      = require('gulp');
var rimraf    = require('rimraf');
var task      = require('../index');
var base      = __dirname;
var fixations = base + '/fixations';


// Setup:

before(clean);
after(clean);


// Tests:

it('creates a gulp task with defaults', function (done) {
  var dir = fixations + '/defaults';
  process.chdir(dir);
  gulp.task('js', task.jsTask());
  gulp.start(['js'], function () {
    var source = fs.readFileSync(dir + '/build/app.js').toString();
    var map = fs.readFileSync(dir + '/build/app.js.map').toString();
    expect(source).to.have.string('success!');
    expect(map).to.have.string('success!');
    done();
  });
});


// Utils:

function clean () {
  console.log('\nRemoving ' + fixations + '/**/build');
  rimraf.sync(fixations + '/**/build');
  console.log();
}

