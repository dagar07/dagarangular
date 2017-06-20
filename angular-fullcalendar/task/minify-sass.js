'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var rename = require('gulp-rename');

var DIR_SASS_LIB = ['./src/calendar/hd-calandar.scss'];
var DIR_SASS_DEV = ['./src/main/main.scss'];
var DEST_SASS = "./src/dist/";

module.exports = {
	devSass : function () {
		return gulp.src(DIR_SASS_DEV)
				.pipe(sass({outputStyle : "compressed"}).on("error", gutil.log))
				.pipe(rename("app.min.css"))
				.pipe(gulp.dest(DEST_SASS))
	},
	libSass : function () {
		return gulp.src(DIR_SASS_LIB)
				.pipe(sass())
				.pipe(rename('hd-calandar.css'))
				.pipe(gulp.dest(DEST_SASS));
	}
};