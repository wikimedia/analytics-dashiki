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
    replace = require('gulp-replace'),
    uglify = require('gulp-uglify'),
    htmlreplace = require('gulp-html-replace'),
    rev = require('gulp-rev'),
    jshint = require('gulp-jshint'),
    fs = require('fs'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace');

// gulp-replace versions the files in the stream appending a hash
// so dist/scripts.js becomes dist/scripts-7926a17b.js
// creates also a manifest file like:
/*
{
  "project-selector.js": "project-selector-8c4e0fe3.js",
  "vega-timeseries.js": "vega-timeseries-ec0bf85c.js",
  "scripts.js": "scripts-7926a17b.js"
}
that we use later to replace js (and css files) on index.html
and in the main requirejs bundle
*/
var rev = require('gulp-rev');


//Since deleting files doesn't work on the file contents
//there's no reason to use a gulp plugin. An excellent opportunity to use a vanilla node module.
var del = require('del');

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
            'components/metric-selector/metric-selector',
            'components/time-selector/time-selector'
        ],
        insertRequire: ['app/startup'],
        bundles: {
            // If you want parts of the site to load on demand, remove them from the 'include' list
            // above, and group them into bundles here.
            'project-selector': ['components/project-selector/project-selector'],
            'vega-timeseries': ['components/visualizers/vega-timeseries/vega-timeseries'],
            'breakdown-toggle': ['components/breakdown-toggle/breakdown-toggle']

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
gulp.task('js', ['clean'], function () {
    return rjs(requireJsOptimizerConfig)
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(rev())
        .pipe(gulp.dest('./dist/'))
        .pipe(rev.manifest())
        .pipe(rename('js.manifest.json'))
        .pipe(gulp.dest('./dist/'));
});


gulp.task('css', ['clean'], function () {
    // css filenames make concatenation order deterministic
    // as it matters for css rules
    return gulp.src(['src/css/*.css'])
        .pipe(concat('style.css')).pipe(rev()).pipe(gulp.dest('./dist/'))
        // Add rev-manifest.json as a new src to prevent rev'ing rev-manifest.json
        .pipe(rev.manifest())
        .pipe(rename('css.manifest.json'))
        .pipe(gulp.dest('./dist/'));
});



/** Copies semantic fonts where the css expects them to be**/
gulp.task('fonts', ['clean'], function () {
    var semantic_fonts = 'src/fonts';
    return gulp.src([semantic_fonts + '/icons.svg', semantic_fonts + '/icons.ttf', semantic_fonts + '/icons.woff'])
        .pipe(gulp.dest('./fonts/'));
});

// Copies index.html, replacing <script> and <link> tags to reference production URLs
// with their versioned counterpart
// updates the main require.js file bundle configuration (scripts.js, see above)
// with references to versioned bundles
gulp.task('replace', ['css', 'js'], function () {

    // these manifests have been created by task rev.manifest before
    var jsManifest = JSON.parse(fs.readFileSync('./dist/js.manifest.json', 'utf8'));
    var cssManifest = JSON.parse(fs.readFileSync('./dist/css.manifest.json', 'utf8'));

    // figure out what bundles do we have setup on requirejs
    var bundles = Object.getOwnPropertyNames(jsManifest).filter(function (p) {
        return p !== 'scripts.js';
    });

    var regex = '';
    bundles.forEach(function (element, index, array) {
        var l = element.length;
        // we are trying to match  "project-selector" (quotes-included)
        regex = regex + '\"(' + element.substr(0, element.length - 3) + ')\"\:|';

    });

    //remove last '|', out come should be like: "(project-selector)"|"(vega-timeseries)"
    regex = regex.substring(0, regex.length - 1);

    // this build system is so inflexible that makes me want to cry
    function replaceByVersion(match) {
        // remove quotes from match and add ".js"
        // so we can key on the manifest with versions
        match = match.substring(1, match.length - 2);
        match = match + ".js";
        var version = jsManifest[match];

        version = '\"' + version + '\":';
        return version;
    }

    var regexObj = new RegExp(regex, "g");

    gulp.src(['./dist/' + jsManifest['scripts.js']])
        .pipe(replace(regexObj, replaceByVersion))
        .pipe(gulp.dest('./dist/'));

    return gulp.src('./src/index.html')
        .pipe(htmlreplace({
            'css': cssManifest['style.css'],
            'js': jsManifest['scripts.js']
        }))
        .pipe(gulp.dest('./dist/'));
});



// Removes all files from ./dist/ (w/o using streams)
// you can negate patterns
gulp.task('clean', function (callback) {
    del([
        'dist/*.js',
        'dist/*.css',
        'dist/*.html',
        'dist/*.json'
    ], callback);
});

gulp.task('default', ['replace', 'lint', 'fonts'], function (callback) {
    callback();
    console.log('\nPlaced optimized files in ' + chalk.magenta('dist/\n'));
    console.log('\nPlaced font files in ' + chalk.magenta('fonts/\n'));
});

function logWatcher(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}
gulp.watch('./src/**/*.js', ['replace']).on('change', logWatcher);
gulp.watch('./src/**/*.html', ['replace']).on('change', logWatcher);
gulp.watch('./src/**/*.css', ['replace']).on('change', logWatcher);