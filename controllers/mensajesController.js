const db = require('../db/connection');

// Obtener mensajes entre dos usuarios
exports.getMensajes = async (req, res) => {
    try {
        const { usuario1Id, usuario2Id } = req.params;
        
        const mensajes = await db('mensajes')
            .where(function() {
                this.where({ emisor_id: usuario1Id, receptor_id: usuario2Id })
                    .orWhere({ emisor_id: usuario2Id, receptor_id: usuario1Id });
            })
            .join('users as emisor', 'mensajes.emisor_id', 'emisor.id')
            .join('users as receptor', 'mensajes.receptor_id', 'receptor.id')
            .select(
                'mensajes.*',
                'emisor.nombre as emisor_nombre',
                'receptor.nombre as receptor_nombre'
            )
            .orderBy('fecha_envio', 'asc');
            
        res.json(mensajes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener mensajes' });
    }
};

// Enviar mensaje
exports.sendMensaje = async (req, res) => {
    try {
        const { emisor_id, receptor_id, contenido } = req.body;
        
        // Validación básica
        if (!emisor_id || !receptor_id || !contenido) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }
        
        await db('mensajes').insert({ 
            emisor_id, 
            receptor_id, 
            contenido,
            fecha_envio: new Date(),
            estado: 'entregado'
        });
        
        res.json({ message: 'Mensaje enviado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al enviar mensaje' });
    }
};