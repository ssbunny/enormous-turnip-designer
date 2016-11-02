var pkg = require('./package.json');
var gulp = require('gulp');
var header = require('gulp-header');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

// ------------------------------------------

var buildDate = new Date();

var jsfileHeader = ['/*!',
    ' * <%= pkg.name %>',
    ' * <%= pkg.description %>',
    ' * ',
    ' * @version v<%= pkg.version %>',
    ' * @author <%= pkg.author %>',
    ' * @license <%= pkg.license %>',
    ' * ',
    ' * Build on: <%= date %>',
    ' * - handsontable version: <%= pkg.dependencies.handsontable %>',
    ' * - formulajs version: <%= pkg.dependencies.formulajs %>',
    ' */',
    ''].join('\n');

// ------------------------------------------

gulp.task('scripts', [
    'scripts-debug'
]);

gulp.task('scripts-debug', function () {
    return browserify({
        entries: 'src/browser.js',
        debug: false
    }).transform(babelify, {presets: ['es2015']})
        .bundle()
        .pipe(source('spreadsheet.js'))
        .pipe(header(jsfileHeader, {pkg: pkg, date: buildDate}))
        .pipe(gulp.dest('dist'));
});


gulp.task('test', function () {
    return browserify({
        entries: 'test/test.js',
        debug: false
    }).transform(babelify, {presets: ['es2015']})
        .bundle()
        .pipe(source('test.js'))
        .pipe(header(jsfileHeader, {pkg: pkg, date: buildDate}))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
    gulp.watch('src/**/*.js', ['scripts']);
});

gulp.task('default', ['scripts']);