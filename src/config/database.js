const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

console.log('🔧 Iniciando configuración de base de datos...');

// Verificar sqlite3 antes de continuar
try {
  require.resolve('sqlite3');
  console.log('✅ sqlite3 encontrado en node_modules');
  const sqlite3 = require('sqlite3');
  console.log('📦 sqlite3 versión:', sqlite3.VERSION);
} catch (error) {
  console.error('❌ sqlite3 no encontrado:', error.message);
  console.log('📁 Contenido de node_modules:');
  const nodeModules = path.join(__dirname, '../../node_modules');
  if (fs.existsSync(nodeModules)) {
    const dirs = fs.readdirSync(nodeModules);
    console.log(dirs.filter(d => d.includes('sqlite')).join(', '));
  }
  process.exit(1);
}

const storage = process.env.NODE_ENV === 'production'
  ? '/tmp/data/database.sqlite'
  : path.join(__dirname, '../../database.sqlite');

console.log('📁 Usando base de datos en:', storage);

if (process.env.NODE_ENV === 'production') {
  const dataDir = '/tmp/data';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Directorio /tmp/data creado');
  }
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storage,
  logging: console.log,
  define: {
    timestamps: true,
    underscored: false
  }
});

module.exports = sequelize;