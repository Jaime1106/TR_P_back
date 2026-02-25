const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

dotenv.config();

const app = express();

// Configurar CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://tu-frontend.netlify.app' // Cambiar después
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
    message: 'Backend funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

const PORT = process.env.PORT || 5000;

// Función para iniciar el servidor
async function startServer() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a BD exitosa');
    
    await sequelize.sync();
    console.log('✅ Modelos sincronizados');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar:', error);
    process.exit(1);
  }
}

startServer();