const db = require('../db/connection');

// GET /favoritos/:userId
exports.getFavoritosByUser = async (req, res) => {
  try {
    const { userId } = req.params; // ← usa userId, coincide con la ruta
    const favoritos = await db('favoritos').where({ usuario_id: userId });
    res.json(favoritos);
  } catch (error) {
    console.error("❌ Error en getFavoritosByUser:", error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
};

// POST /favoritos
exports.addFavorito = async (req, res) => {
  try {
    const { usuario_id, propiedad_id } = req.body;
    if (!usuario_id || !propiedad_id) {
      return res.status(400).json({ error: 'usuario_id y propiedad_id son requeridos' });
    }

    await db('favoritos').insert({
      usuario_id,
      propiedad_id,
      fecha_agregado: new Date().toISOString()
    });

    res.json({ message: 'Favorito añadido con éxito' });
  } catch (error) {
    console.error("❌ Error en addFavorito:", error);
    res.status(500).json({ error: 'Error al añadir favorito' });
  }
};

// DELETE /favoritos/:id
exports.deleteFavorito = async (req, res) => {
  try {
    const { id } = req.params;
    await db('favoritos').where({ id }).del();
    res.json({ message: 'Favorito eliminado' });
  } catch (error) {
    console.error("❌ Error en deleteFavorito:", error);
    res.status(500).json({ error: 'Error al eliminar favorito' });
  }
};

// GET /favoritos/check?usuario_id=...&propiedad_id=...
exports.checkFavorito = async (req, res) => {
  try {
    const { usuario_id, propiedad_id } = req.query;

    if (!usuario_id || !propiedad_id) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    const favorito = await db('favoritos')
      .where({ usuario_id, propiedad_id })
      .first();

    res.json({ exists: !!favorito });
  } catch (error) {
    console.error("❌ Error en checkFavorito:", error);
    res.status(500).json({ error: 'Error al verificar favorito' });
  }
};
