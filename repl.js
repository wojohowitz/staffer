'use strict';
const repl = require('repl');
const environment = process.env.NODE_ENV || 'development';

let myRepl = repl.start({
  prompt: `Staffer[${environment}]>`,
  terminal: true,
});

require('repl.history')(myRepl, process.env.HOME + '/.node_repl_history');
myRepl.context.models = require('./db/sequelize/models');
