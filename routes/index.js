const express = require('express');
const router = express.Router();

// Importa routers específicos
const resenasRouter = require('./resenas');

// Configura las rutas
router.use('/resenas', resenasRouter);

module.exports = router;