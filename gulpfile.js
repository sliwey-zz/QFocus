var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var minifycss = require('gulp-minify-css');

var options = {
	preserveComments : function(node, comment) {
	    var value = comment.value;
	    var type = comment.type;
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