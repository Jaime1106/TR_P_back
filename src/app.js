const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('./models');

dotenv.config();

// IMPORTANTE: Crear directorio para datos en Railway
if (process.env.NODE_ENV === 'production') {
  const dataDir = '/data';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Directorio /data creado');
  }
}

const calendarRoutes = require('./routes/calendarRoutes');

const app = express();

// Configurar CORS para Netlify (lo agregaremos después)
const allowedOrigins = [
  'http://localhost:5173',
  'https://tu-app.netlify.app' // Cambiar después
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/calendar', calendarRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando correctamente',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

sequelize.sync()
  .then(() => {
    console.log('✅ Base de datos SQLite sincronizada');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });