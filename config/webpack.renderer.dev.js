'use strict';

const paths = require('./paths');

const opts = {
  port: 9001,
};

module.exports = {
  mode: 'development',
  // target: 'web',
  devtool: 'eval-source-map',
  // entry: [
    // 'css-hot-loader/hotModuleReplacement',
  // ],
  output: {
    pathinfo: true,
    path: paths.dist,
    filename: 'renderer.js',
    publicPath: '/',
  },
  devServer: {
    contentBase: paths.dist,
    port: opts.port,
    publicPath: '/',
    watchContentBase: true,
    overlay: true,
    hot: true,
  },
};
