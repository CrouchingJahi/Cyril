'use strict';

const webpack = require('webpack');
const merge = require('webpack-merge');
const paths = require('./paths');

const opts = {
  production: process.env.NODE_ENV === 'production',
  babel: {
    presets: [
      [
        "@babel/preset-env",
        {
          modules: false,
          targets: {
            // electron: require('electron/package.json').version,
            node: 'current',
          }
        }
      ]
    ]
  },
};

const config = {
  target: 'electron-main',
  entry: [
    paths.mainEntry,
  ],
  output: {
    pathinfo: false,
    path: paths.dist,
    filename: 'main.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': paths.main
    }
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [
      // linter
      /*{
        test: /\.js$/,
        enforce: 'pre',
        use: [{
          options: {
            formatter: require.resolve('react-dev-utils/eslintFormatter'),
            eslintPath: require.resolve('eslint'),
          },
          loader: require.resolve('eslint-loader'),
        }],
        include: paths.src
      },*/
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: opts.babel,
        }
      },
      {
        // set up scss so that the variables can be imported, but no styles need to be used
        test: /\.scss$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            }
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
            }
          }
        ]
      },
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin({ multiStep: false }),
    // new webpack.WatchIgnorePlugin([])
  ]
};

module.exports = merge(
  config,
  opts.production ? require('./webpack.main.prod') : require('./webpack.main.dev'),
);
