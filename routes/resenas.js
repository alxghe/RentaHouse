const express = require('express');
const router = express.Router();
const resenasController = require('../controllers/resenasController');
const authenticate = require('../middlewares/auth');

// Debug: Verifica que todos los handlers son funciones
console.log('[DEBUG] authenticate type:', typeof authenticate);
console.log('[DEBUG] getResenasByPropiedad type:', typeof resenasController.getResenasByPropiedad);
console.log('[DEBUG] addResena type:', typeof resenasController.addResena);
console.log('[DEBUG] deleteResena type:', typeof resenasController.deleteResena);

// Rutas
router.get('/propiedad/:propiedadId', resenasController.getResenasByPropiedad);
router.post('/', authenticate, resenasController.addResena);
router.delete('/:id', authenticate, resenasController.deleteResena);

module.exports = router;