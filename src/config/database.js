const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// En Railway, usar /data/database.sqlite (persistente)
const storage = process.env.NODE_ENV === 'production'
  ? '/data/database.sqlite'
  : path.join(__dirname, '../../database.sqlite');

console.log('📁 Usando base de datos:', storage);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storage,
  logging: false,
  dialectOptions: {
    mode: require('better-sqlite3').OPEN_READWRITE | require('better-sqlite3').OPEN_CREATE
  },
  define: {
    timestamps: true,
    underscored: false
  }
});

module.exports = sequelize;