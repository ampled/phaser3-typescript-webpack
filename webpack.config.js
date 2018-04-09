// @ts-check

const HtmlWebPackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const webpack = require('webpack');
const path = require('path');

module.exports = {
  devServer: {
    host: '0.0.0.0'
  },
  entry: {
    main: path.resolve(__dirname, 'src/index.ts')
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      },
      {
        test: [/\.vert$/, /\.frag$/],
        use: 'raw-loader'
      },
      {
        test: [
          /\.(png|fnt|mp3|ogg)$/
        ],
        use: [{ loader: 'file-loader', options: { name: 'assets/[name].[hash].[ext]' } }]
      },
      {
        type: 'javascript/auto',
        test: /\.json$/,
        use: [{ loader: 'file-loader', options: { name: 'assets/[name].[hash].[ext]' } }]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      WEBGL_RENDERER: true,
      CANVAS_RENDERER: true
    }),
    new HtmlWebPackPlugin({
      template: './src/index.html'
    })
  ]
}