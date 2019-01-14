'use strict';

const paths = require('./paths');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  output: {
    pathinfo: true,
    path: paths.dist,
    filename: 'main.dev.js',
    publicPath: './'
  },
  // plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    // new webpack.NoEmitOnErrorsPlugin(),
  // ]
};
