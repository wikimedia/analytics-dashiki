/*jslint node: true, stupid: true */
// Node modules
var fs = require('fs'),
    vm = require('vm'),
    merge = require('deeply'),
    chalk = require('chalk'),
    es = require('event-stream');

// Gulp and plugins
var gulp = require('gulp'),
    rjs = require('gulp-requirejs-bundler'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    replace = require('gulp-replace'),
    uglify = require('gulp-uglify'),
    htmlreplace = require('gulp-html-replace'),
    jshint = require('gulp-jshint');

// Config
var requireJsRuntimeConfig = vm.runInNewContext(fs.readFileSync('src/app/require.config.js') + '; require;'),
    requireJsOptimizerConfig = merge(requireJsRuntimeConfig, {
        out: 'scripts.js',
        baseUrl: './src',
        name: 'app/startup',
        paths: {
            requireLib: 'bower_modules/requirejs/require'
        },
        include: [
            'requireLib',
            'components/wikimetrics-visualizer/wikimetrics-visualizer',
            'components/wikimetrics-layout/wikimetrics-layout',
            'components/visualizers/vega-timeseries/vega-timeseries',
            'components/wikimetrics-layout/wikimetrics-layout',
            'components/metric-selector/metric-selector',
            'components/time-selector/time-selector'
        ],
        insertRequire: ['app/startup'],
        bundles: {
            // If you want parts of the site to load on demand, remove them from the 'include' list
            // above, and group them into bundles here.
            'project-selector': ['components/project-selector/project-selector']
        }
    });

var jsfilesToLint = ['src/app/*.js', 'src/components/*/*.js', 'src/lib/*.js'];

// linting
gulp.task('lint', function () {
    return gulp.src(jsfilesToLint)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Discovers all AMD dependencies, concatenates together all required .js files, minifies them
gulp.task('js', function () {
    return rjs(requireJsOptimizerConfig)
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(gulp.dest('./dist/'));
});


var jsfilesToLint = ['src/app/*.js', 'src/components/*/*.js', 'src/lib/*.js'];


gulp.task('css', function () {
    return gulp.src(['src/css/*.css'])
        .pipe(concat('style.css'))
        .pipe(gulp.dest('./dist/'));
});

/** Copies semantic fonts where the css expects them to be**/
gulp.task('fonts', function () {
    var semantic_fonts = 'src/fonts';
    return gulp.src([semantic_fonts + '/icons.svg', semantic_fonts + '/icons.ttf', semantic_fonts + '/icons.woff'])
        .pipe(gulp.dest('./fonts/'));
});


// Copies index.html, replacing <script> and <link> tags to reference production URLs
gulp.task('html', function () {
    return gulp.src('./src/index.html')
        .pipe(htmlreplace({
            'css': 'style.css',
            'js': 'scripts.js'
        }))
        .pipe(gulp.dest('./dist/'));
});

// Removes all files from ./dist/
gulp.task('clean', function () {
    return gulp.src('./dist/**/*', {
            read: false
        })
        .pipe(clean());
});

gulp.task('default', ['html', 'lint', 'js', 'css', 'fonts'], function (callback) {
    callback();
    console.log('\nPlaced optimized files in ' + chalk.magenta('dist/\n'));
    console.log('\nPlaced font files in ' + chalk.magenta('fonts/\n'));
});

function logWatcher(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}
gulp.watch('./src/**/*.js', ['js']).on('change', logWatcher);
gulp.watch('./src/**/*.html', ['html']).on('change', logWatcher);
gulp.watch('./src/**/*.css', ['css']).on('change', logWatcher);
