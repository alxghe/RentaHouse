const express = require('express');
const router = express.Router();
const propiedadesController = require('../controllers/propiedadesController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Configuración simplificada para una sola imagen
router.get('/', propiedadesController.listar);
router.get('/:id', propiedadesController.obtener);
router.post('/', auth, upload.array('imagenes', 5), propiedadesController.crear);
router.put('/:id', auth, propiedadesController.actualizar);
router.delete('/:id', auth, propiedadesController.eliminar);

module.exports = router;