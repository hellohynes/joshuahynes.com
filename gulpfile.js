//
//  ================================================================================
//  @  SETTINGS
//     Turn different build features on/off
//  ================================================================================
var settings = {
    clean: true,        // Turn on/off clean tasks
    scripts: false,     // Turn on/off script tasks
    styles: true,       // Turn on/off style tasks
    svgs: false,         // Turn on/off SVG tasks
    sync: true,         // Turn on/off sync tasks
    build: true,        // Turn on/off build tasks
    watch: true         // Turn on/off watch tasks
};

//  ================================================================================
//  @  PACKAGES
//     What makes everything go
//  ================================================================================
//  @@ GENERAL
var {gulp, src, dest, watch, series, parallel} = require('gulp');
var fs = require('fs-extra');
var del = require('del');
var rename = require('gulp-rename');
var browsersync = require('browser-sync').create();
var package = require('./package.json');

//  @@ STYLES
var postcss = settings.styles ? require('gulp-postcss') : null;
var cssnano = settings.styles ? require('cssnano') : null;
var less = settings.styles ? require('gulp-less') : null;

//  @@ BUILD
var cp = settings.build ? require('child_process') : null;


//  ================================================================================
//  @  PATHS
//     Where everything is in this project
//  ================================================================================
var paths = {
    clean: {
        site: './site/_site/**/*'
    },
    scripts: {
        input: './assets/js/',
        output: './site/assets/js/'
    },
    styles: {
        input: './assets/css/*',
        output: './site/assets/css/',
    },
    build: {
        input: './site/',
        dest: './site/_site/'
    },
    watch: {
        assets: './assets/**/*',
        site: './site/**/*',
        siteExcludeSite: '!./site/_site/**/*',
        siteExcludeAssets: '!./site/assets/**/*'
    }
}

//  ================================================================================
//  @   TASKS
//      Where everything happens
//  ================================================================================
//  @@  CLEAN UP
//  ================================================================================
//  --  Function to clean out folders / files
const cleanUp = (items) => {
    // Make sure the feature is active before running
    if(!settings.clean) return done();

    // Clean dist folders
    return Promise.all([
        del.sync(items)
    ]);
};

//  --  Clean out doc and library files
const cleanSite = () => {
    return cleanUp([
        paths.clean.site
    ]);
}


//  ================================================================================
//  @@  COMPILE CSS
//      Lint, minify, and concatenate style files
//  ================================================================================
//  --  LIBRARY FILES
var styles = function(done) {
    //  Make sure this feature is activated before running
    if (!settings.styles) return done();

    //  Compile library files
    return src(paths.styles.input)
        .pipe(less())
        .pipe(postcss([
            cssnano()
        ]))
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest(paths.styles.output));

    done();
};



//  ================================================================================
//  @@  BUILD SITE
//  ================================================================================
var site = function(done) {

    //  Make sure this feature is activated before running
    if (!settings.build) return done();

    return cp.spawn(
        'npx', [
            '@11ty/eleventy'
        ], {
            cwd: paths.build.input,
            stdio: 'inherit'
        }
    );

    done();
};

//  ================================================================================
//  @@  START SERVER
//  ================================================================================
var startServer = function(done) {

    //  Make sure this feature is activated before running
    if (!settings.watch) return done();

    //  Start the server
    browsersync.init({
        server: {
            baseDir: paths.build.dest
        },
        open: false,
        port: 4000
    });

    //  Signal completion
    done();
};


//  ================================================================================
//  @@  RELOAD THE BROWSER
//  ================================================================================
//  --  Reload the browser when files change
var reloadBrowser = function(done) {

    //  Make sure this feature is activated before running
    if (!settings.watch) return done();

    //  Reload the browser
    browsersync.reload();
    done();
};


//  ================================================================================
//  @@  WATCH CHANGES
//  ================================================================================
var watchFiles = function(done) {

    //  Make sure this feature is activated before running
    if (!settings.watch) return done();

    //  Watch files
    watch([
        paths.watch.assets,
        paths.watch.site,
        paths.watch.siteExcludeSite,
        paths.watch.siteExcludeAssets
    ], series(exports.default, reloadBrowser));
    done();
};


//  ================================================================================
//  @   EXPORT TASKS
//  ================================================================================
//  --  BUILD OUT THE SITE BUT DON'T START THE SERVER
exports.default = series(
    cleanSite,
    styles,
    site
);

exports.watch = series(
    exports.default,
    startServer,
    watchFiles
)
