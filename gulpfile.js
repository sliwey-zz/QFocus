var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	minifycss = require('gulp-minify-css');

var options = {
	preserveComments : function(node, comment) {
	    var value = comment.value,
	    	type = comment.type;
	    if (type == "comment2") {
	        return /author/i.test(value);
	    }
	}
};

gulp.task('uglify', function() {
	return gulp.src('./src/js/*.js')
		.pipe(uglify(options))
		.pipe(rename({suffix : '.min'}))
		.pipe(gulp.dest('./dist/js/'));
});

gulp.task('minifycss', function() {
	return gulp.src('./src/css/*.css')
		.pipe(minifycss({keepBreaks:true}))
		.pipe(rename({suffix : '.min'}))
		.pipe(gulp.dest('./dist/css'));
});

gulp.task('watch', function() {
	gulp.watch('./src/js/*.js', ['uglify']);
	gulp.watch('./src/css/*.css', ['minifycss']);
});

gulp.task('default', ['watch', 'uglify', 'minifycss']);