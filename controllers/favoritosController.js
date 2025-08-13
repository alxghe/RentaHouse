const db = require('../db/connection'); 

// Obtener todos los favoritos de un usuario
exports.getFavoritosByUser = async (req, res) => {
    try {
        const { usuarioId } = req.params; // en la ruta debería ser /favoritos/:usuarioId
        const favoritos = await db('favoritos').where({ usuario_id: usuarioId });
        res.json(favoritos);
    } catch (error) {
        console.error("❌ Error en getFavoritosByUser:", error);
        res.status(500).json({ error: 'Error al obtener favoritos' });
    }
};

// Añadir un favorito
exports.addFavorito = async (req, res) => {
    try {
        const { usuario_id, propiedad_id } = req.body;
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



// Eliminar un favorito
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
