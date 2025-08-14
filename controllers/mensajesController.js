// controllers/mensajesController.js
const db = require('../db/connection');

exports.getConversaciones = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Método compatible con SQLite sin fotos de perfil
        const allMessages = await db('mensajes')
            .select(
                'mensajes.*',
                db.raw('CASE WHEN mensajes.emisor_id = ? THEN mensajes.receptor_id ELSE mensajes.emisor_id END as other_user_id', [userId]),
                'u.nombre as usuario_nombre'
            )
            .join('users as u', 'u.id', db.raw('CASE WHEN mensajes.emisor_id = ? THEN mensajes.receptor_id ELSE mensajes.emisor_id END', [userId]))
            .where('emisor_id', userId)
            .orWhere('receptor_id', userId)
            .orderBy('fecha_envio', 'desc');

        // Procesar para obtener conversaciones únicas
        const uniqueConversations = [];
        const processedUsers = new Set();

        for (const message of allMessages) {
            if (!processedUsers.has(message.other_user_id)) {
                uniqueConversations.push({
                    usuario: {
                        id: message.other_user_id,
                        nombre: message.usuario_nombre,
                        // foto: null // No existe en tu base de datos
                    },
                    ultimo_mensaje: message.contenido,
                    fecha_ultimo_mensaje: message.fecha_envio
                });
                processedUsers.add(message.other_user_id);
            }
        }

        res.json(uniqueConversations);
    } catch (error) {
        console.error("Error en getConversaciones:", error);
        res.status(500).json({ 
            error: 'Error al obtener conversaciones',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};
// controllers/mensajesController.js
exports.createConversacion = async (req, res) => {
    try {
        const { propiedad_id, contenido } = req.body;
        const usuario_id = req.user.id; // El que envía el mensaje

        // Obtener el dueño de la propiedad
        const propiedad = await db('propiedades')
            .where({ id: propiedad_id })
            .first();

        if (!propiedad) {
            return res.status(404).json({ error: 'Propiedad no encontrada' });
        }

        // Crear el mensaje inicial
        const [mensajeId] = await db('mensajes').insert({
            emisor_id: usuario_id,
            receptor_id: propiedad.usuario_id,
            contenido,
            fecha_envio: new Date(),
            estado: 'entregado'
        });

        res.status(201).json({ 
            mensajeId,
            receptor_id: propiedad.usuario_id,
            propiedad_id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar conversación' });
    }
};
// Añade este método al controlador
exports.getOrCreateConversation = async (req, res) => {
    try {
        const { propiedad_id } = req.body;
        const usuario_id = req.user.id;

        // 1. Verificar si ya existe una conversación
        const existing = await db('mensajes')
            .where({ propiedad_id, emisor_id: usuario_id })
            .orWhere({ propiedad_id, receptor_id: usuario_id })
            .first();

        if (existing) {
            return res.json({
                receptor_id: existing.emisor_id === usuario_id ? 
                    existing.receptor_id : existing.emisor_id,
                exists: true
            });
        }

        // 2. Crear nueva conversación si no existe
        const propiedad = await db('propiedades')
            .where({ id: propiedad_id })
            .first();

        if (!propiedad) {
            return res.status(404).json({ error: 'Propiedad no encontrada' });
        }

        // Mensaje inicial automático
        await db('mensajes').insert({
            emisor_id: usuario_id,
            receptor_id: propiedad.usuario_id,
            propiedad_id,
            contenido: `Hola, estoy interesado en tu propiedad "${propiedad.titulo}"`,
            fecha_envio: new Date()
        });

        res.json({ receptor_id: propiedad.usuario_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al gestionar conversación' });
    }
};
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