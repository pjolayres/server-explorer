const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const pixrem = require('pixrem');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const browserSync = require('browser-sync').create();
const sitemap = require('gulp-sitemap');
const handlebars = require('gulp-compile-handlebars');
const path = require("path");
const rename = require('gulp-rename');
const svgstore = require('gulp-svgstore');
const svgo = require('gulp-svgo');
const copy = require('gulp-copy');
const jshint = require('gulp-jshint');

const buildpath = {
    main: 'dist/',
    js: 'dist/js/',
    css: 'dist/css/',
    images: 'dist/images/',
    fonts: 'dist/fonts/',
    favicon: 'dist/favicon/'
}

var scripts = [
    'node_modules/svg4everybody/dist/svg4everybody.js',
    'node_modules/jquery/dist/jquery.js',
    'assets/js/**/*.js'
];

var stylesheets = [
    'assets/sass/style-rtl.scss', 
    'assets/sass/style-ltr.scss'
];


gulp.task('copy', ['copy:favicon', 'copy:images', 'copy:fonts', 'copy:robots']);

gulp.task('copy:robots', function(cb) {
    return gulp.src(['assets/robots.txt'])
        .pipe(copy(buildpath.main, {
            prefix: 2
        }));
});

gulp.task('copy:favicon', function(cb) {
    return gulp.src(['assets/favicon/**/*'])
        .pipe(copy(buildpath.favicon, {
            prefix: 2
        }));
});

gulp.task('copy:fonts', function(cb) {
    return gulp.src(['node_modules/bootstrap-sass/assets/fonts/bootstrap/**/*'])
        .pipe(copy(buildpath.fonts, {
            prefix: 4
        }));
});

gulp.task('copy:images', function(cb) {
    return gulp.src(['assets/images/**/*'])
        .pipe(copy(buildpath.images, {
            prefix: 2
        }));
});

gulp.task('concat', function () {
    return gulp.src(scripts)
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(buildpath.js));
});

gulp.task('uglify', ['concat'], function(cb) {
    return gulp.src(buildpath.js + '/scripts.js')
        .pipe(uglify())
        .pipe(gulp.dest(buildpath.js));
});

gulp.task('css:dev', function () {
    var processors = [
        //pixrem(),
        autoprefixer({
            browsers: ['last 2 versions']
        })
    ];

    return gulp.src(stylesheets)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(buildpath.css));
});

gulp.task('css:prod', function () {
    var processors = [
        //pixrem(),
        autoprefixer({
            browsers: ['last 2 versions']
        }),
        cssnano({
            safe: true
        })
    ];

    return gulp.src(frontendStylesheets)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(gulp.dest(buildpath.css));
});


gulp.task('svgo', function() {
    return gulp.src('assets/icons/*.svg')
        .pipe(svgo())
        .pipe(gulp.dest('assets/icons'));
});

gulp.task('svgstore', ['svgo'], function() {
    return gulp
        .src('assets/icons/*.svg')
        .pipe(rename({
            prefix: 'icon-'
        }))
        .pipe(svgstore())
        .pipe(gulp.dest(buildpath.images));
});


gulp.task('watch', function() {
    gulp.watch(['source/**/*.html', 'partials/**/*.html'], ['handlebars']);
    gulp.watch(['assets/sass/**/*.scss'], ['css:dev']);
    gulp.watch(['assets/js/**/*.js'], ['concat']);
    gulp.watch(['assets/icons/*.svg'], ['svgstore']);
    gulp.watch(['assets/images/**/*'], ['copy:images']);
});

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
});


gulp.task('sitemap', function() {
    gulp.src('dist/**/*.html', {
            read: false
        })
        .pipe(sitemap({
            changefreq: 'weekly',
            siteUrl: 'http://www.prototype.ae/',
            lastmod: '2016-01-01T09:54:31.000Z',
            priority: '1'
        }))
        .pipe(gulp.dest(buildpath.main));
});


gulp.task('handlebars', function() {
    var options = {
        batch: ['partials']
    };

    var files = [
        ['source/index.html', 'dist/index.html']
    ];

    return files.forEach(function(filePair) {
        var src = filePair[0];
        var dist = filePair[1];
        var distDir = path.dirname(dist);
        var distFileName = path.basename(dist);

        return gulp.src(src)
            .pipe(handlebars({}, options))
            .pipe(rename(distFileName))
            .pipe(gulp.dest(distDir))
            .pipe(browserSync.stream());
    });
});


gulp.task('w3cjs', function() {
    var w3cjs = require('gulp-w3cjs');
    return gulp.src(buildpath.main + '**/*.html')
        .pipe(w3cjs())
        .pipe(w3cjs.reporter());
});

gulp.task('a11y', function() {
    var access = require('gulp-accessibility');
    return gulp.src(buildpath.main + '**/*.html')
        .pipe(access({
            force: true
        }))
        .on('error', console.log);
});

gulp.task('jshint', function() {
    return gulp.src('assets/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('critical', function(cb) {
    var critical = require('critical');
    var files = [
        ['index.html', 'dist/index.html']
    ];

    files.forEach(function(filePair) {
        critical.generate({
            inline: true,
            base: buildpath.main,
            src: filePair[0],
            dest: filePair[1],
            minify: true,
            width: 1440,
            height: 700
        });
    });
});

gulp.task('default', ['copy', 'handlebars', 'svgstore', 'concat', 'css:dev', 'browserSync', 'watch']);
gulp.task('prod', ['copy', 'handlebars', 'svgstore', 'uglify', 'css:prod']);
gulp.task('test', ['w3cjs', 'a11y', 'jshint']);
