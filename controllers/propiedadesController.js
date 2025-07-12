const db = require('../db/connection');

exports.listar = async (req, res) => {
  try {
    const propiedades = await db('propiedades');
    res.json(propiedades);
  } catch (err) {
        console.error(err); // ⬅️ Añadir esto
    res.status(500).json({ error: 'Error al listar propiedades' });
  }
};

exports.crear = async (req, res) => {
  try {
    const data = {
      ...req.body,
      usuario_id: req.user.id,                    // ← se establece aquí
      estado_disponibilidad: 'disponible',
      fecha_publicacion: new Date()
    };
    const [id] = await db('propiedades').insert(data);
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear propiedad' });
  }
};


exports.obtener = async (req, res) => {
  try {
    const propiedad = await db('propiedades').where({ id: req.params.id }).first();
    res.json(propiedad);
  } catch (err) {
        console.error(err); // ⬅️ Añadir esto

    res.status(500).json({ error: 'Error al obtener propiedad' });
  }
};

exports.actualizar = async (req, res) => {
  try {
    await db('propiedades').where({ id: req.params.id }).update(req.body);
    res.json({ message: 'Propiedad actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar propiedad' });
  }
};

exports.eliminar = async (req, res) => {
  try {
    await db('propiedades').where({ id: req.params.id }).del();
    res.json({ message: 'Propiedad eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar propiedad' });
  }
};
