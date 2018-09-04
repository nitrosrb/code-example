import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import gulpif from 'gulp-if';
import sass from 'gulp-sass';
import server from 'browser-sync';
import yargs from 'yargs';
import del from 'del';
import path from 'path';
import child from 'child_process';

const exec = child.exec;
const argv = yargs.argv;
const root = 'src/';
const paths = {
  dist: './dist/',
  scripts: `${root}scripts/**/*.js`,
  styles: `${root}styles/**/*.scss`,
  modules: {
    scripts: [
      'jquery/dist/jquery.js',
      'bootstrap/dist/js/bootstrap.js',
    ],
    styles: [
      'bootstrap/dist/css/bootstrap.css',
    ],
  },
  static: [
    `${root}**/*.html`,
    `${root}fonts/**/*`,
    `${root}img/**/*`,
  ],
};

server.create();

function clean(cb) {
  return del(`${paths.dist}**/*`, cb);
}

function copy() {
  return gulp.src(paths.static, {
    base: 'src',
  }).pipe(gulp.dest(paths.dist));
}

const prep = gulp.series(clean, copy);

const vendor = {
  scripts() {
    return gulp.src(paths.modules.scripts.map(item => `node_modules/${item}`))
      .pipe(concat('vendor.js'))
      .pipe(gulpif(argv.deploy, uglify()))
      .pipe(gulp.dest(`${paths.dist}js/`));
  },
  styles() {
    return gulp.src(paths.modules.styles.map(item => `node_modules/${item}`))
      .pipe(sass({
        outputStyle: 'compressed',
      }))
      .pipe(concat('vendor.css'))
      .pipe(gulp.dest(`${paths.dist}css/`));
  }
}

const bundle = {
  scripts() {
    return gulp.src(paths.scripts)
      .pipe(concat('bundle.js'))
      .pipe(gulpif(argv.deploy, uglify()))
      .pipe(gulp.dest(`${paths.dist}js/`));
  },
  styles() {
    return gulp.src(paths.styles)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sass({
      outputStyle: 'compressed',
    }))
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest(`${paths.dist}css/`));
  }
}

const scripts = gulp.series(vendor.scripts, bundle.scripts);
const styles = gulp.series(vendor.styles, bundle.styles);

function serve() {
  server.init({
    files: [`${paths.dist}/**`],
    port: 4000,
    server: {
      baseDir: paths.dist,
    },
  });
}

function watch() {
  gulp.watch(paths.scripts, gulp.parallel(scripts));
  gulp.watch(paths.styles, gulp.parallel(styles));
  gulp.watch(paths.static, gulp.parallel(copy));
}

const initialize = gulp.parallel(serve, watch);
const deploy = gulp.series(styles, scripts);

gulp.task('default', gulp.series(prep, gulp.parallel(styles, scripts), initialize));
gulp.task('production', gulp.series(prep, deploy));
