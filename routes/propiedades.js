const express = require('express');
const router = express.Router();
const propiedadesController = require('../controllers/propiedadesController');
const authenticate = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Configuración simplificada para una sola imagen
router.get('/', propiedadesController.listar);
router.get('/:id', propiedadesController.obtener);
router.post('/', authenticate, upload.array('imagenes', 5), propiedadesController.crear);
router.put('/:id', authenticate, propiedadesController.actualizar);
router.delete('/:id', authenticate, propiedadesController.eliminar);

module.exports = router;