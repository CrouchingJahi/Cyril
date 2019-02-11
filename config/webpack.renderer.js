'use strict';

const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const paths = require('./paths');

const opts = {
  production: process.env.NODE_ENV === 'production',
  html: {
    inject: true,
    title: 'Cyril',
    meta: {
      // "theme-color": '#ffcc00',
    },
    filename: paths.htmlOut,
    template: paths.template,
    alwaysWriteToDisk: true,
  },
  babel: {
    presets: [
      [ '@babel/preset-react',
        {
          modules: false,
          development: process.env.NODE_ENV !== 'production',
        }
      ],
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
    ]
  }
};

const config = {
  target: 'electron-renderer',
  entry: [
    paths.rendererEntry,
  ],
  output: {
    pathinfo: true,
    path: paths.dist,
    filename: 'renderer.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': paths.renderer,
    }
  },
  node: {
    __dirname: true,
    __filename: true,
  },
  module: {
    rules: [
      // linter
      /*{
        test: /\.jsx?$/,
        enforce: 'pre',
        use: [{
          options: {
            formatter: require(), // need to find formatter i want
            eslintPath: require('eslint'),
          },
          loader: require.resolve('eslint-loader'),
        }],
        include: paths.src
      },*/
      {
        oneOf: [
          // { test: /\.(html)$/, use: { loader: 'html-loader' } },
          {
            test: /\.(gif|jpe?g|png|svg)$/,
            use: {
              loader: 'url-loader',
              options: {
                limit: 10240, //filesize limit for embedding as data urls
                name: 'imgs/[name].[ext]',
              },
            }
          },
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: opts.babel,
            }
          },
          {
            test: /\.scss$/,
            use: [
              opts.production ? MiniCssExtractPlugin.loader : 'style-loader',
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 2,
                  sourceMap: true,
                  // modules: true,
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  implementation: require('sass'),
                  // fiber: require('fibers'),
                }
              }
            ]
          },
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin(opts.html),
    new MiniCssExtractPlugin({
      filename: "cyril.css",
      chunkFilename: "[id].css"
    }),
    new webpack.HotModuleReplacementPlugin({
      fullBuildTimeout: 200,
      requestTimeout: 10000,
    }),
  ],
};

module.exports = merge(
  config,
  opts.production ? require('./webpack.renderer.prod') : require('./webpack.renderer.dev'),
);
