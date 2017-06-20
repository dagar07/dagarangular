var gulp = require('gulp');
var browserify = require('browserify');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');


gulp.task("devJs", require('./task/minify-js.js').devJs);
gulp.task("libJs", require('./task/minify-js.js').bundleLibs);

gulp.task("devScss", require('./task/minify-sass.js').devSass);
gulp.task("libScss", require('./task/minify-sass.js').libSass);
gulp.task('watch', function(){
    return gulp.watch('./src/**/*', { usePolling: true }, ['runCalGulp']);
})
gulp.task('runCalGulp', function () {
	runSequence('libJs', 'devJs','libScss','devScss', 'watch');
});