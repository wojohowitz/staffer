'use strict';

import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import dbCfg from '../config/databaseCfg';


const env       = process.env.NODE_ENV || 'development';
const config    = dbCfg[env];
const  basename  = path.basename(module.filename);
var db        = {};

let sequelize = new Sequelize(config.database, config.username, config.password, config);

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
