/// <reference path="node_modules/webpack-dev-server/types/lib/Server.d.ts"/>
import HtmlWebPackPlugin from 'html-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import type { Configuration } from 'webpack';

import webpack from 'webpack';
import path from 'path';

const config: Configuration = {
  devServer: {
    host: 'localhost',
    hot: 'only',
    static: path.resolve(__dirname, 'src', 'assets'),
  },
  entry: {
    main: path.resolve(__dirname, 'src/index.ts'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  output: {
    assetModuleFilename: 'images/[hash][ext][query]',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /\.tsx$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: [/\.vert$/, /\.frag$/],
        type: 'asset/source',
      },
      {
        test: [/\.(png|fnt|mp3|ogg)$/],
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name].[hash][ext]',
        },
        // use: [
        //   {
        //     loader: 'file-loader',
        //     options: { name: 'assets/[name].[hash].[ext]' },
        //   },
        // ],
      },
      {
        test: /\.json$/,
        type: 'asset/resource',
        generator: {
          filename: '[name].[hash][ext]',
        },
        // use: [
        //   {
        //     loader: 'file-loader',
        //     options: { name: 'assets/[name].[hash].[ext]' },
        //   },
        // ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      WEBGL_RENDERER: true,
      CANVAS_RENDERER: true,
      USELOCALSTORAGE: true,
      'typeof SHADER_REQUIRE': JSON.stringify(false),
      'typeof CANVAS_RENDERER': JSON.stringify(true),
      'typeof WEBGL_RENDERER': JSON.stringify(true),
    }),
    new HtmlWebPackPlugin({
      template: './src/index.html',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};

export default config;
