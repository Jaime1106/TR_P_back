const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// En Render, usar /data/database.sqlite (persistente en free tier)
// En local, usar database.sqlite en la raíz
const storage = process.env.NODE_ENV === 'production'
  ? '/data/database.sqlite'
  : path.join(__dirname, '../../database.sqlite');

console.log('📁 Usando base de datos:', storage);

// Asegurar que el directorio existe (solo en producción)
if (process.env.NODE_ENV === 'production') {
  const dataDir = '/data';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Directorio /data creado');
  }
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storage,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false
  }
});

module.exports = sequelize;