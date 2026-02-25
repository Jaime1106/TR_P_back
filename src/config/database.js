const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// En Render, usar /tmp/data (tiene permisos de escritura)
const storage = process.env.NODE_ENV === 'production'
  ? '/tmp/data/database.sqlite'
  : path.join(__dirname, '../../database.sqlite');

console.log('📁 Usando base de datos:', storage);

// Asegurar que el directorio existe
if (process.env.NODE_ENV === 'production') {
  const dataDir = '/tmp/data';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Directorio /tmp/data creado');
  }
}

// Configuración específica para better-sqlite3
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