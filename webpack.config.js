var path    = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var vendorFiles = require('./vendorFiles.js');
const modulesPath = path.resolve(__dirname, 'node_modules');

module.exports = {
  devtool: 'eval-cheap-module-sourcemap',
  entry: {
    app: ['webpack-hot-middleware/client?reload=true', './src/app.js'],
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
       { test: /\.jade$/, loader: 'jade' },
       { 
         test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
         loader: 'url?limit=10000&mimetype=application/font-woff'
       },
       { 
         test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
         loader: 'url?limit=10000&mimetype=application/font-woff'
       },
       { 
         test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
         loader: 'url?limit=10000&mimetype=application/octet-stream'
       },
       { 
         test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
         loader: 'file'
       },
       {
         test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
         loader: 'url?limit=10000&mimetype=application/svg+xml&name=assets/[name].svg'
       },
    ]
  },
  sassLoader: {
    includePaths: [
      modulesPath
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: isExternal
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.jade',
      title: 'Staffer',
      inject: 'body',
      filename: 'index.html'
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  // devServer: {
  //   proxy: {
  //     '/api*': {
  //       target: 'http://localhost:8081',
  //       secure: false,
  //     },
  //   },
  // }
}

function isExternal(module) {
  var userRequest = module.userRequest;
  if(typeof userRequest !== 'string') return false;
  return userRequest.indexOf('/node_modules/') >= 0;
}
