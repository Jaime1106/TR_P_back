const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// En producción (Railway), usar /data/database.sqlite que es persistente
const storage = process.env.NODE_ENV === 'production'
  ? '/data/database.sqlite'
  : path.join(__dirname, '../../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storage,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    // Para better-sqlite3
    mode: require('better-sqlite3').OPEN_READWRITE | require('better-sqlite3').OPEN_CREATE
  },
  define: {
    timestamps: true,
    underscored: false
  }
});

// Probar conexión
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a SQLite establecida');
    console.log('📁 Base de datos:', storage);
  })
  .catch(err => {
    console.error('❌ Error conectando a SQLite:', err);
  });

module.exports = sequelize;