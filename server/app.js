'use strict';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { AppLogger, ErrorLogger } from './logger';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../webpack.config.js';

import API from './routes/index';
import Auth from './routes/auth';

import connectDb from '../db/camo/db';

connectDb();
const devEnv = process.env.NODE_ENV !== 'production';
const servePath = path.join(__dirname, '..', 'dist');

let app = express();

app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 9999);

app.use(AppLogger());
app.use(bodyParser.json());

// app.use('/api', API);
app.use('/auth', Auth);

if(devEnv) {
  const compiler = webpack(webpackConfig);
  const middleware = webpackMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: 'src',
    stats: {
      colors:       true,
      hash:         false,
      timings:      true,
      chunks:       false,
      chunkModules: false,
      modules:      false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', (req, res) => {
    res.write(middleware.fileSystem.readFileSync(servePath, 'index.html'));
    res.end();
  });

} else {
  app.use(express.static(servePath));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(servePath, 'index.html'));
  });
}

app.use(ErrorLogger());
app.use(finalErrorHandler);

function finalErrorHandler(err, req, res, next) {
  res.status(500).send({error: err});
}

app.listen(app.get('port'), '0.0.0.0', (err) => {
  if(err) console.log(err);
  console.log(`Staffer running in ${app.get('env')} on port ${app.get('port')}`);
})
