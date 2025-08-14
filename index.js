require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const favoritosRoutes = require('./routes/favoritos');
const resenasRoutes = require('./routes/resenas.js');
const mensajesRoutes = require('./routes/mensajes');

// 1. Configuración inicial
app.use(cors());

// 2. Middleware para parsear JSON y form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', require('./routes')); // Esto es opcional, dependiendo de tu estructura

// Ruta específica para mensajes
app.use('/mensajes', require('./routes/mensajes'));
// Integracion de funciones
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/resenas', resenasRoutes);
app.use('/api/mensajes', mensajesRoutes);


// 3. Configuración avanzada de la carpeta uploads
const uploadsDir = path.join(__dirname, 'uploads');

// Crear carpeta si no existe con verificación de permisos
const ensureUploadsDir = () => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✓ Carpeta uploads creada');
    }

    // Verificar permisos de escritura
    fs.accessSync(uploadsDir, fs.constants.W_OK);
    console.log('✓ Permisos de escritura confirmados');
    
    return true;
  } catch (err) {
    console.error('× Error en la carpeta uploads:', err.message);
    
    // Intento alternativo con permisos más abiertos (solo para desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      try {
        fs.chmodSync(uploadsDir, 0o755);
        console.log('✓ Permisos ajustados temporalmente (solo desarrollo)');
        return true;
      } catch (chmodErr) {
        console.error('× No se pudo ajustar permisos:', chmodErr.message);
      }
    }
    
    return false;
  }
};

// Ejecutar la verificación al iniciar
ensureUploadsDir();

// 4. Servir archivos estáticos con configuración mejorada
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    // Configuración de CORS para archivos estáticos
    res.set('Access-Control-Allow-Origin', '*');
    // Cache control (1 día para desarrollo)
    res.set('Cache-Control', 'public, max-age=86400');
  }
}));

app.use(express.static('public'));

// 5. Middleware para logging mejorado
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    
    if (req.files) {
      console.log('📁 Archivos recibidos:', 
        req.files.map(f => ({
          name: f.originalname,
          size: `${(f.size / 1024).toFixed(2)}KB`,
          type: f.mimetype
        }))
      );
    }
  });

  next();
});

// 6. Rutas principales
app.use('/api/users', require('./routes/users'));
app.use('/api/propiedades', require('./routes/propiedades'));

// 7. Manejo de errores mejorado
app.use((err, req, res, next) => {
  console.error('🔥 Error global:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    body: req.body,
    files: req.files
  });

  // Eliminar archivos subidos si hubo error
  if (req.files) {
    req.files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
        console.log(`🗑️ Archivo ${file.filename} eliminado por error`);
      } catch (unlinkErr) {
        console.error('Error al eliminar archivo temporal:', unlinkErr);
      }
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 8. Iniciar servidor con verificación final
app.listen(PORT, () => {
  console.log('\n=== Servidor iniciado ===');
  console.log(`🔌 Puerto: ${PORT}`);
  console.log(`📂 Ruta de uploads: ${uploadsDir}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Listo en http://localhost:${PORT}\n`);
});

// Manejo de cierre para limpieza
process.on('SIGINT', () => {
  console.log('\n🔴 Servidor deteniéndose...');
  process.exit(0);
});