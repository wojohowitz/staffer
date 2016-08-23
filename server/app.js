'use strict';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { AppLogger } from './logger';


let app = express();

app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 8080);

app.use(AppLogger());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '..', 'dist')));

app.get('/api/testRoute', (req, res, next) => res.send({success: true}));

app.listen(app.get('port'), () => {
  console.log(`Staffer running in ${app.get('env')} on port ${app.get('port')}`);
})
