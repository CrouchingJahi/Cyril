const path = require('path');

function getPath (...dir) {
  return path.join(__dirname, '..', ...dir);
}

module.exports = {
  src: getPath('src'),
  dist: getPath('dist'),
  main: getPath('src', 'main'),
  renderer: getPath('src', 'renderer'),
  assets: getPath('src', 'assets'),
  mainEntry: getPath('src', 'main', 'index.js'),
  rendererEntry: getPath('src', 'renderer', 'index.js'),
  template: getPath('src', 'renderer', 'index.html'),
  htmlOut: getPath('dist', 'index.html'),
};
