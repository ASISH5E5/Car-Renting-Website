'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;

try {
  if (config.use_env_variable && process.env[config.use_env_variable]) {
    console.log('Using database URL from environment variable:', process.env[config.use_env_variable]);
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
  } else if (config.url) {
    console.log('Using database URL directly from config.json:', config.url);
    sequelize = new Sequelize(config.url, config);
  } else {
    console.log('Using database configuration from config.json:', config.database);
    sequelize = new Sequelize(config.database, config.username, config.password, config);
  }

  fs
    .readdirSync(__dirname)
    .filter(file => (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    ))
    .forEach(file => {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    });

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  console.log('Connection to the database has been established successfully.');
} catch (error) {
  console.error('Unable to initialize Sequelize:', error);
}

module.exports = db;
