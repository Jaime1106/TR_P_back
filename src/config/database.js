const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Determinar ruta según entorno
const storage = process.env.NODE_ENV === 'production'
  ? '/tmp/data/database.sqlite'  // Render usa /tmp (con permisos)
  : path.join(__dirname, '../../database.sqlite');

console.log('📁 Usando base de datos SQLite3 en:', storage);

// En producción, asegurar que el directorio existe
if (process.env.NODE_ENV === 'production') {
  const dataDir = '/tmp/data';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Directorio /tmp/data creado');
  }
}

// Configuración estándar para sqlite3
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storage,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  },
  retry: {
    max: 3,
    timeout: 3000
  }
});

// Probar conexión inmediatamente
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite3 establecida correctamente');
  } catch (error) {
    console.error('❌ Error conectando a SQLite3:', error.message);
  }
})();

module.exports = sequelize;