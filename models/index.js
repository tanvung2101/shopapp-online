'use strict';

import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import process from 'process';
import configAll from '../config/config.js';
import { fileURLToPath } from 'url';

const env = process.env.NODE_ENV || "development";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const config = configAll[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Load models dynamically
const files = fs.readdirSync(__dirname).filter(file => {
  return (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    !file.endsWith('.test.js')
  );
});

for (const file of files) {
  const modelModule = await import(path.join(__dirname, file));
  const model = modelModule.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
// sequelize.authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//     return sequelize.sync({ alter: true });
//   })
//   .then(() => console.log("Tables updated"))
//   .catch(err => console.error('Unable to connect to the database:', err));


export default db;
