const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { sequelize } = require('./models');

dotenv.config();

const app = express();

// Configurar CORS (importante)
app.use(cors({
  origin: ['http://localhost:5173', 'https://tu-frontend.netlify.app'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const calendarRoutes = require('./routes/calendarRoutes');
app.use('/api/calendar', calendarRoutes);

// Health check (OBLIGATORIO para Render)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

// Conectar BD y iniciar servidor
sequelize.sync()
  .then(() => {
    console.log('✅ Base de datos conectada');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error BD:', err);
  });