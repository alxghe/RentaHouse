const express = require('express');
const router = express.Router();
const mensajesController = require('../controllers/mensajesController');
const authenticate = require('../middlewares/auth');

router.get('/:usuario1Id/:usuario2Id', authenticate, mensajesController.getMensajes);
router.post('/', authenticate, mensajesController.sendMensaje);

module.exports = router;