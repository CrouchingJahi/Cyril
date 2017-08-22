const gulp = require('gulp'),
  electron = require('electron-connect').server.create();

const input = {
  index: 'app/index.html',
  jsx: 'src/ui/**/*.jsx'
};
const output = {
  dir: 'app',
};

gulp.task('serve', function () {
  electron.start();
});

gulp.task('dev', function () {
  gulp.watch([input.jsx], electron.reload);
});

gulp.task('default', ['serve']);
