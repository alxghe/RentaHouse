const express = require('express');
const router = express.Router();
const favoritosController = require('../controllers/favoritosController');
const authenticate = require('../middlewares/auth');

// Importante: rutas específicas antes que las dinámicas
router.get('/check', authenticate, favoritosController.checkFavorito);
router.get('/:userId', authenticate, favoritosController.getFavoritosByUser);
router.post('/', authenticate, favoritosController.addFavorito);
router.delete('/:id', authenticate, favoritosController.deleteFavorito);

module.exports = router;
