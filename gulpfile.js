const { src, dest, watch, series, parallel } = require('gulp');
const browserSync = require('browser-sync').create();
const useref = require('gulp-useref');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const { init, write } = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const nunjucksRender = require('gulp-nunjucks-render');
const sass = require('gulp-sass')(require('sass'));

function sassTask() {
  return src('app/sass/**/*.scss')
    .pipe(sass()) //using gulp-sass
    .pipe(init())
    .pipe(write())
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

function nunjucksTask() {
  return (
    src('app/pages/**/*.+(html|nunjucks)')
      // Renders template with nunjucks
      .pipe(
        nunjucksRender({
          path: ['app/templates'],
        })
      )
      // output files in app folder
      .pipe(dest('./app'))
  );
}

function userefTask() {
  return src('app/*.html')
    .pipe(useref())
    .pipe(gulpif('*.css', cssnano()))
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.js', dest('./')))
    .pipe(gulpif('*.css', dest('./')))
    .pipe(gulpif('*.html', dest('./')));
}

function imagesTask() {
  return (
    src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
      // Caching images that ran through imagemin
      .pipe(dest('./images'))
  );
}

function fontsTask() {
  return src('app/fonts/**/*.+(ttf|woff|eof|svg)').pipe(dest('./fonts'));
}

function cssTask() {
  return src('app/css/**/*').pipe(dest('./css'));
}

function nodeModulesTask() {
  return src('./node_modules/**/*').pipe(dest('app/node_modules'));
}

// BrowserSync
function browserSyncTask(done) {
  browserSync.init({
    server: {
      baseDir: './app',
      browser: 'chrome',
    },
    port: 3000,
  });
  done();
}

// BrowserSync Reload
function browserSyncReloadTask(done) {
  browserSync.reload();
  done();
}

// Watch files
function watchFilesTask() {
  watch('app/sass/**/*.scss', sassTask);
  //Reloads the browser whenever HTML or JS files changes
  watch(
    'app/pages/**/*.+(html|nunjucks)',
    parallel(nunjucksTask, browserSyncReloadTask)
  );
  watch(
    'app/templates/*.+(html|nunjucks)',
    parallel(nunjucksTask, browserSyncReloadTask)
  );
  watch(
    'app/templates/partials/*.+(html|nunjucks)',
    parallel(nunjucksTask, browserSyncReloadTask)
  );
}

// exports.production = productionTask;
exports.browserSync = browserSyncTask;
exports.css = cssTask;
exports.fonts = fontsTask;
// exports.clear = clearTask;
exports.images = imagesTask;
exports.useref = userefTask;
exports.sass = sassTask;
exports.nunjucks = nunjucksTask;
exports.nodeModulesTask = nodeModulesTask;
exports.default = series(
  sassTask,
  nunjucksTask,
  browserSyncTask,
  watchFilesTask,
  cssTask,
  nodeModulesTask
);
exports.production = series(
  sassTask,
  nunjucksTask,
  userefTask,
  fontsTask,
  imagesTask,
  cssTask
);
