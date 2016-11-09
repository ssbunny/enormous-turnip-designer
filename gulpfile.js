var pkg = require('./package.json');
var gulp = require('gulp');
var header = require('gulp-header');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat');

// ------------------------------------------

var buildDate = JSON.stringify(new Date());

var jsfileHeader = ['/*!',
    ' * <%= pkg.name %>',
    ' * <%= pkg.description %>',
    ' * ',
    ' * @version v<%= pkg.version %>',
    ' * @author <%= pkg.author %>',
    ' * @license <%= pkg.license %>',
    ' * ',
    ' * Build on: <%= date %>',
    ' * - handsontable version: <%= pkg.vendors.handsontable %>',
    ' * - formulajs version: <%= pkg.dependencies.formulajs %>',
    ' * - moment version: <%= pkg.vendors.moment %>',
    ' * - numbro version: <%= pkg.vendors.numbro %>',
    ' * - pikaday version: <%= pkg.vendors.pikaday %>',
    ' * - zeroclipboard version: <%= pkg.vendors.zeroclipboard %>',
    ' */',
    ''].join('\n');

var uglifyMangle = [
    'require', 'exports', 'module', 'import', 'from',
    'export', 'default'
];

// ------------------------------------------

gulp.task('scripts', ['scripts-libs', 'scripts-core', 'scripts-optimized'], function () {
    gulp.src(
        [
            'dist/separate/spreadsheet-libs.js',
            'dist/separate/spreadsheet-core.js'
        ])
        .pipe(concat('spreadsheet-all.js'))
        .pipe(gulp.dest('dist/separate'));
    gulp.src(
        [
            'dist/separate/spreadsheet-libs-debug.js',
            'dist/separate/spreadsheet-core-debug.js'
        ])
        .pipe(concat('spreadsheet-all-debug.js'))
        .pipe(gulp.dest('dist/separate'));
});


gulp.task('scripts-optimized', ['scripts-core-debug'], function () {
    gulp.src(
        [
            'libs/moment/moment.js',
            'libs/moment/locale/zh-cn.js',
            'libs/pikaday/pikaday.js',
            'libs/numbro/numbro.js',
            'libs/numbro/languages/zh-CN.min.js',
            'libs/zeroclipboard/ZeroClipboard.js',
            'libs/handsontable.js',
            'dist/separate/spreadsheet-core-debug.js'
        ])
        .pipe(concat(`spreadsheet-${pkg.version}.js`))
        .pipe(uglify({
            mangle: {except: uglifyMangle}
        }))
        .pipe(replace('@@_version_@@', pkg.version))
        .pipe(header(jsfileHeader, {pkg: pkg, date: buildDate}))
        .pipe(gulp.dest('dist'));
});


gulp.task('scripts-libs', function () {
    return gulp.src('libs/handsontable.full.js')
        .pipe(rename('spreadsheet-libs-debug.js'))
        .pipe(gulp.dest('dist/separate'))
        .pipe(rename('spreadsheet-libs.js'))
        .pipe(uglify({
            mangle: {except: uglifyMangle},
            preserveComments: 'license'
        }))
        .pipe(gulp.dest('dist/separate'));
});


gulp.task('scripts-core', ['scripts-core-debug'], function () {
    return gulp.src('dist/separate/spreadsheet-core-debug.js')
        .pipe(rename('spreadsheet-core.js'))
        .pipe(uglify({
            mangle: {except: uglifyMangle},
            preserveComments: 'license'
        }))
        .pipe(gulp.dest('dist/separate'));
});

gulp.task('scripts-core-debug', function () {
    return browserify({
        entries: 'src/browser.js',
        debug: true
    }).transform(babelify, {presets: ['es2015']})
        .bundle()
        .pipe(source('spreadsheet-core-debug.js'))
        .pipe(replace('@@_version_@@', pkg.version))
        .pipe(header(jsfileHeader, {pkg: pkg, date: buildDate}))
        .pipe(gulp.dest('dist/separate'));
});



gulp.task('default', ['scripts']);