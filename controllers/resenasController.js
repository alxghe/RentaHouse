const db = require('../db/connection');

// Obtener reseñas de una propiedad
exports.getResenasByPropiedad = async (req, res) => {
    try {
        const { propiedadId } = req.params;
        const resenas = await db('resenas')
            .where({ propiedad_id: propiedadId })
            .join('users', 'resenas.usuario_id', 'users.id')
            .select('resenas.*', 'users.nombre as usuario_nombre');
            
        res.json(resenas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener reseñas' });
    }
};

// Crear una reseña
exports.addResena = async (req, res) => {
    try {
        // usuario_id ahora viene del token validado
        const usuario_id = req.user.id;
        const { propiedad_id, comentario, calificacion } = req.body;
        
        if (!usuario_id || !propiedad_id || !comentario || calificacion == null) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        await db('resenas').insert({ 
            propiedad_id, 
            usuario_id, 
            comentario, 
            calificacion,
            fecha_resena: new Date() 
        });
        
        res.json({ message: 'Reseña añadida con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al añadir reseña' });
    }
};


// Añade este método que falta
exports.deleteResena = async (req, res) => {
    try {
        const { id } = req.params;
        await db('resenas').where({ id }).del();
        res.json({ message: 'Reseña eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar reseña' });
    }
};