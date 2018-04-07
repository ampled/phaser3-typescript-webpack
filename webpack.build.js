// @ts-check

const config = require('./webpack.config');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

config.plugins.push(
  new UglifyJsPlugin({
    sourceMap: true,
    cache: true,
    uglifyOptions: {
      compress: true,
      parallel: 4
    }
  })
)

module.exports = config;