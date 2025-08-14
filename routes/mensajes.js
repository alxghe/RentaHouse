const express = require('express');
const router = express.Router();
const mensajesController = require('../controllers/mensajesController');
const authenticate = require('../middlewares/auth');

// Nueva ruta para conversaciones
// En routes/mensajes.js
router.post('/init-conversation', authenticate, mensajesController.getOrCreateConversation);

router.get('/conversaciones', authenticate, mensajesController.getConversaciones);
// routes/mensajes.js
router.post('/iniciar', authenticate, mensajesController.createConversacion);

// Rutas existentes
router.get('/:usuario1Id/:usuario2Id', authenticate, mensajesController.getMensajes);
router.post('/', authenticate, mensajesController.sendMensaje);

module.exports = router;