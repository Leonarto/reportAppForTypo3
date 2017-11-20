/**
 * Created by Leonarto on 09-11-2017.
 */

'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var maps = require('gulp-sourcemaps');
var sass = require('gulp-sass');

// It concat all js files
gulp.task('concat', function(){
  return gulp.src([    // El usar el return le indica, a toda task que la llame, cuando esta task termine de ejecutarse.
    'js/notMain/graphs.js',
    'js/notMain/fechaWin.js',
    'js/notMain/navbar.js',
    'js/notMain/configWin.js',
    'js/notMain/baseTemplate.js',
    'js/notMain/general.js',
    'js/main.js']) // get the source
      .pipe(maps.init())
      .pipe(concat('reportesApp.js')) // concat into one single file named app.js
      .pipe(maps.write('./'))
      .pipe(gulp.dest('../Javascript')); // destiny folder
});

// It compiles sass with gulp
gulp.task("sass", function (){
  return gulp.src("scss/reportesApp.scss")
      .pipe(maps.init()) // allows sourcemap creation
      .pipe(sass())    // init sass compilation
      .pipe(maps.write('./')) // Will write the sourcemap, string is dir relative to output directory
      .pipe(gulp.dest('../Css')); // This is the output directory
});

gulp.task('watchFiles', function(){
  gulp.watch(
      ['scss/**/*.scss'], // Va al directorio scss, toma todos los archivos y carpetas del directorio, y toma todos los archivos .scss de los sub directorios
      ['sass']);    // Cada vez que se modifique uno de esos directorios, correra el task compileSass
  gulp.watch(['js/**/*.js'], ['concat']);
});

gulp.task('softCompile', ['concat', 'sass']);