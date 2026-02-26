const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
require('./config/check-sqlite');

dotenv.config();

const app = express();

// Configurar CORS
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL || 'https://tr-pro.netlify.app/'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const calendarRoutes = require('./routes/calendarRoutes');
app.use('/api/calendar', calendarRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando con SQLite3',
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

// Iniciar servidor
async function startServer() {
  try {
    console.log('🔄 Iniciando servidor...');
    console.log('🌍 Entorno:', process.env.NODE_ENV);
    
    // Verificar sqlite3
    const sqlite3 = require('sqlite3');
    console.log('✅ sqlite3 versión:', require('sqlite3/package.json').version);
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite3 exitosa');
    
    // Sincronizar modelos (crea tablas si no existen)
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar:', error);
    process.exit(1);
  }
}

startServer();