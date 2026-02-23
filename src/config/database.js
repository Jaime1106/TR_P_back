const { Sequelize } = require('sequelize');
require('dotenv').config();

// SQLite - no requiere servidor, todo en un archivo
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // El archivo se crea automáticamente
  logging: false,
  define: {
    timestamps: true,
    underscored: false
  }
});

module.exports = sequelize;