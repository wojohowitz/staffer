'use strict';
const repl = require('repl');
const environment = process.env.NODE_ENV || 'development';

let myRepl = repl.start({
  prompt: `Staffer[${environment}]>`,
  terminal: true,
});
var fs  = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var dbCfg = require('./db/sequelize/config/database.json');


const env       = process.env.NODE_ENV || 'development';
const config    = dbCfg[env];
const  basename  = path.basename(module.filename);
var db        = {};

let sequelize = new Sequelize(config.database, config.username, config.password, config);
var modelsPath = path.resolve('./db/sequelize/models');
var model;
fs
  .readdirSync(modelsPath)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js'basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    model = sequelize['import'](path.join(modelsPath, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;


require('repl.history')(myRepl, process.env.HOME + '/.node_repl_history');
myRepl.context.models = db;
