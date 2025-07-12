const express = require('express');
const router = express.Router();
const propiedadesController = require('../controllers/propiedadesController');
const auth = require('../middlewares/auth');

router.post('/', auth, propiedadesController.crear);
router.get('/', propiedadesController.listar);
router.post('/', propiedadesController.crear);
router.get('/:id', propiedadesController.obtener);
router.put('/:id', propiedadesController.actualizar);
router.delete('/:id', propiedadesController.eliminar);
    

module.exports = router;
