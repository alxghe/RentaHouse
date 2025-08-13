const express = require('express');
const router = express.Router();
const favoritosController = require('../controllers/favoritosController');
const authenticate = require('../middlewares/auth');

router.get('/:userId', authenticate, favoritosController.getFavoritosByUser);
router.post('/', authenticate, favoritosController.addFavorito);
router.delete('/:id', authenticate, favoritosController.deleteFavorito);
console.log('Tipo de auth:', typeof auth); // Debe mostrar "function"

module.exports = router;