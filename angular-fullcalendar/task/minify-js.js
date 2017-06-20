'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify'); 
var gutil = require('gulp-util');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var DEST_JS = "./src/dist/";
var LIBS_JS = [
			"./bower_components/angular/angular.js",
			"./bower_components/moment/moment.js",
			"./src/calendar/hd-calendar.js"
			];
var DEV_JS = ["./src/main/main.js"];

module.exports = {
	devJs : function () {
		return browserify(DEV_JS)
    			.bundle()
    			.pipe(source('app.min.js'))
		 		.pipe(gulp.dest(DEST_JS));
	},

	bundleLibs : function () {
		return gulp.src(LIBS_JS)
				.pipe(concat("app-calendar.js").on('error', gutil.log))
				.pipe(gulp.dest(DEST_JS));
	}
}