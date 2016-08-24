var path    = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var vendorFiles = require('./vendorFiles.js');
const modulesPath = path.resolve(__dirname, 'node_modules');

module.exports = {
  devtool: 'sourcemap',
  entry: {
    app: ['webpack-hot-middleware/client?reload=true', './src/app.js'],
    vendor: vendorFiles
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].bundle.js',
  },
  module: {
    loaders: [
       { test: /\.js$/, exclude: [/app\/lib/, /node_modules/], loader: 'ng-annotate!babel' },
       { test: /\.html$/, loader: 'raw' },
       { test: /\.scss$/, 
         loaders: [
           'style',
           'css?sourceMap',
           'sass?sourceMap'
         ]
       },
       { test: /\.css$/, loader: 'style!css' },
       { test: /\.(eot|svg|ttf|woff|woff2)$/,
         loader: 'url' },
       { test: /\.jade$/, loader: 'jade' }
    ]
  },
  sassLoader: {
    includePaths: [
      modulesPath
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.jade',
      title: 'Staffer',
      inject: 'body',
      filename: 'index.html'
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    proxy: {
      '/api*': {
        target: 'http://localhost:8081',
        secure: false,
      },
    },
  }
}
