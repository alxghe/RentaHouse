const db = require('../db/connection');
const path = require('path');
const fs = require('fs');

exports.listar = async (req, res) => {
  try {
    const propiedades = await db('propiedades');
    res.json(propiedades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar propiedades' });
  }
};

exports.obtener = async (req, res) => {
  try {
    const propiedad = await db('propiedades').where({ id: req.params.id }).first();
    res.json(propiedad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener propiedad' });
  }
};

// En propiedadesController.js - función crear
exports.crear = async (req, res) => {
  console.log("Inicio de creación de propiedad - Archivos recibidos:", req.files);
  
  try {
    // Validación básica
    if (!req.files || req.files.length === 0) {
      console.warn("No se recibieron archivos");
      return res.status(400).json({ 
        error: "Debe subir al menos una imagen",
        details: "No files were uploaded"
      });
    }

    console.log("Procesando imágenes...");
    const imagenUrls = req.files.map(file => `/uploads/${file.filename}`);

    const propiedadData = {
      ...req.body,
      usuario_id: req.user.id,
      estado_disponibilidad: 'disponible',
      fecha_publicacion: new Date().toISOString(),
      imagen_url: imagenUrls[0] // Primera imagen como principal
    };

    console.log("Insertando en DB:", propiedadData);
    const [id] = await db('propiedades').insert(propiedadData);

    // Guardar imágenes adicionales si es necesario
    if (imagenUrls.length > 1) {
      await db('propiedad_imagenes').insert(
        imagenUrls.slice(1).map(url => ({
          propiedad_id: id,
          url,
          orden: 0
        }))
      );
    }

    console.log("Propiedad creada exitosamente con ID:", id);
    res.status(201).json({ 
      id,
      message: "Propiedad creada",
      imagenes: imagenUrls
    });

  } catch (err) {
    console.error("Error en controller.crear:", {
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files
    });
    
    // Eliminar archivos subidos si hay error
    if (req.files) {
      req.files.forEach(file => {
        fs.unlinkSync(path.join(__dirname, '../uploads', file.filename));
      });
    }
    
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === "development" ? err.message : null
    });
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