const express = require('express');
const router = express.Router();
const userController = require('../controllers/usersController');
const authenticate = require('../middlewares/auth');

// Rutas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rutas protegidas (requieren autenticación)
router.get('/me', authenticate, userController.getUserInfo); // Información completa
router.get('/me/id', authenticate, userController.getUserId); // Solo el ID

module.exports = router;