const gulp = require('gulp');
const addsrc = require('gulp-add-src');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const minifycss = require('gulp-minify-css');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');
const notify = require('gulp-notify');

const sourcesPath = './src';
const assetsPath = './dist';

const jslibs = [
  sourcesPath + '/js/vendors/jguery-3.1.0.min.js',
  sourcesPath + '/js/vendors/jquery.fancybox.js',
  sourcesPath + '/js/vendors/swiper3.min.js',
  sourcesPath + '/js/vendors/inview.min.js',
  sourcesPath + '/js/vendors/sticky-kit.js',
  sourcesPath + '/js/vendors/jquery.maskedinput.min.js',
  sourcesPath + '/js/vendors/smooth.scroll.js',
];

const jsApp = [
  sourcesPath + '/js/kursMap.js',
  sourcesPath + '/js/app.js'
];


gulp.task('lint', function() {
  return gulp.src(jsApp)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('sass', function() {
  return gulp.src(sourcesPath + '/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 5 version', 'safari 5', 'ie 10', 'opera 12.1'))
    .pipe(gulp.dest(assetsPath))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest(assetsPath));
});

gulp.task('js', function() {
  return gulp.src(jsApp)
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
    .pipe(sourcemaps.init())
    .pipe(addsrc.prepend(jslibs))
    .pipe(concat(assetsPath + '/main.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./'))
    .pipe(notify('Complete!'));
});
// Gulp 4 syntax

// gulp.task('watch:scss', () => { gulp.watch(sourcesPath + '/sass/**/*.scss', gulp.series('sass')) });
// gulp.task('watch:js', () => { gulp.watch(jsApp, gulp.series('babel')) });
// gulp.task('watch', gulp.parallel('watch:scss', 'watch:js'));
// gulp.task('default', gulp.series('sass', 'babel', 'watch') );

gulp.task('watch', function() {
  gulp.watch(sourcesPath + '/sass/**/*.scss', ['sass']);
  gulp.watch(jsApp, ['js']);
});

gulp.task('default', ['sass', 'js', 'watch']);

