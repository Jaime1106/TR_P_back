const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const fs = require('fs');
const path = require('path');

dotenv.config();

const calendarRoutes = require('./routes/calendarRoutes');

const app = express();

// Configurar CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://tu-app.netlify.app', // Cambiar después
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/api/calendar', calendarRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Inicializar base de datos
async function initializeDatabase() {
  try {
    // En producción, asegurar que el directorio /data existe
    if (process.env.NODE_ENV === 'production') {
      const dataDir = '/data';
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('📁 Directorio /data creado');
      }
    }

    // Sincronizar modelos
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados');

    // Verificar si hay datos, si no, ejecutar seed
    const { CalendarRule } = require('./models');
    const count = await CalendarRule.count();
    
    if (count === 0) {
      console.log('🌱 Base de datos vacía, ejecutando seed...');
      require('./scripts/seed.js')();
    } else {
      console.log(`📊 Base de datos contiene ${count} reglas`);
    }

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
  }
}

const PORT = process.env.PORT || 5000;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
});