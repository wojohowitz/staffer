var path    = require('path');
var webpack = require('webpack');
var vendorFiles = require('./vendorFiles.js');
const modulesPath = path.resolve(__dirname, 'node_modules');

module.exports = {
  devtool: 'sourcemap',
  entry: {
    app: './src/app.js',
    vendor: vendorFiles
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'app.bundle.js',
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
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js')
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
