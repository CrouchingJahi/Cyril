const gulp = require('gulp'),
  electron = require('electron-connect').server.create();

const input = {
  index: 'app/index.html',
  js: 'src/ui/**/*.js',
  jsx: 'src/ui/**/*.jsx',
  css: 'src/ui/cyril.css',
};
const output = {
  dir: 'app',
};

gulp.task('serve', function () {
  electron.start();
});

gulp.task('dev', function () {
  gulp.watch([input.index, input.js, input.jsx, input.css], electron.reload);
  electron.start();
});

gulp.task('default', ['serve']);
