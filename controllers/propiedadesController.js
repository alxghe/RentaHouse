const db = require('../db/connection');
const path = require('path');
const fs = require('fs');

exports.listar = async (req, res) => {
  try {
    // Obtener propiedades con sus imágenes relacionadas
    const propiedades = await db('propiedades')
      .leftJoin('propiedad_imagenes', 'propiedades.id', 'propiedad_imagenes.propiedad_id')
      .select('propiedades.*', db.raw('GROUP_CONCAT(propiedad_imagenes.url) as imagenes_adicionales'))
      .groupBy('propiedades.id');

    // Formatear la respuesta para incluir las imágenes como array
    const propiedadesFormateadas = propiedades.map(propiedad => ({
      ...propiedad,
      imagenes_adicionales: propiedad.imagenes_adicionales 
        ? propiedad.imagenes_adicionales.split(',') 
        : []
    }));

    res.json(propiedadesFormateadas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar propiedades' });
  }
};

exports.obtener = async (req, res) => {
  try {
    // Obtener propiedad principal
    const propiedad = await db('propiedades').where({ id: req.params.id }).first();
    
    if (!propiedad) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    // Obtener imágenes adicionales
    const imagenes = await db('propiedad_imagenes')
      .where({ propiedad_id: req.params.id })
      .orderBy('orden', 'asc');

    res.json({
      ...propiedad,
      imagenes_adicionales: imagenes.map(img => img.url)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener propiedad' });
  }
};

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

    // Datos de la propiedad principal
    const propiedadData = {
      ...req.body,
      usuario_id: req.user.id,
      estado_disponibilidad: 'disponible',
      fecha_publicacion: new Date().toISOString(),
      imagen_url: imagenUrls[0] // Primera imagen como principal
    };

    // Iniciar transacción para asegurar integridad
    const trx = await db.transaction();

    try {
      console.log("Insertando propiedad principal...");
      const [propiedadId] = await trx('propiedades').insert(propiedadData);

      // Insertar imágenes adicionales en propiedad_imagenes
      if (imagenUrls.length > 1) {
        console.log("Insertando imágenes adicionales...");
        const imagenesAdicionales = imagenUrls.slice(1).map((url, index) => ({
          propiedad_id: propiedadId,
          url,
          orden: index + 1 // Comenzar desde 1 (0 sería la imagen principal)
        }));

        await trx('propiedad_imagenes').insert(imagenesAdicionales);
      }

      // Commit de la transacción
      await trx.commit();

      console.log("Propiedad creada exitosamente con ID:", propiedadId);
      res.status(201).json({ 
        id: propiedadId,
        message: "Propiedad creada exitosamente",
        imagen_principal: imagenUrls[0],
        imagenes_adicionales: imagenUrls.slice(1)
      });

    } catch (err) {
      // Rollback en caso de error
      await trx.rollback();
      throw err;
    }

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
        const filePath = path.join(__dirname, '../uploads', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    res.status(500).json({ 
      error: "Error al crear propiedad",
      details: process.env.NODE_ENV === "development" ? err.message : null
    });
  }
};

exports.actualizar = async (req, res) => {
  const trx = await db.transaction();
  
  try {
    // Actualizar datos principales
    await trx('propiedades')
      .where({ id: req.params.id })
      .update(req.body);

    // Si se enviaron nuevas imágenes
    if (req.files && req.files.length > 0) {
      const imagenUrls = req.files.map(file => `/uploads/${file.filename}`);

      // Actualizar imagen principal si es la primera
      if (req.body.actualizar_imagen_principal) {
        await trx('propiedades')
          .where({ id: req.params.id })
          .update({ imagen_url: imagenUrls[0] });
      }

      // Obtener el conteo actual de imágenes para esta propiedad
      const countResult = await trx('propiedad_imagenes')
        .where({ propiedad_id: req.params.id })
        .count('* as count')
        .first();
      
      const currentCount = parseInt(countResult.count);

      // Agregar imágenes adicionales
      const nuevasImagenes = imagenUrls.map((url, index) => ({
        propiedad_id: req.params.id,
        url,
        orden: currentCount + index + 1
      }));

      await trx('propiedad_imagenes').insert(nuevasImagenes);
    }

    await trx.commit();
    res.json({ message: 'Propiedad actualizada exitosamente' });

  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ 
      error: 'Error al actualizar propiedad',
      details: process.env.NODE_ENV === "development" ? err.message : null
    });
  }
};

exports.eliminar = async (req, res) => {
  const trx = await db.transaction();
  
  try {
    // Obtener información de imágenes antes de eliminar
    const propiedad = await trx('propiedades')
      .where({ id: req.params.id })
      .first();

    const imagenes = await trx('propiedad_imagenes')
      .where({ propiedad_id: req.params.id })
      .select('url');

    // Eliminar propiedad e imágenes relacionadas
    await trx('propiedad_imagenes').where({ propiedad_id: req.params.id }).del();
    await trx('propiedades').where({ id: req.params.id }).del();

    await trx.commit();

    // Eliminar archivos físicos
    const imagenesAEliminar = [
      propiedad.imagen_url,
      ...imagenes.map(img => img.url)
    ].filter(url => url);

    imagenesAEliminar.forEach(url => {
      const filename = path.basename(url);
      const filePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    res.json({ message: 'Propiedad eliminada exitosamente' });

  } catch (err) {
    await trx.rollback();
    console.error(err);
    res.status(500).json({ 
      error: 'Error al eliminar propiedad',
      details: process.env.NODE_ENV === "development" ? err.message : null
    });
  }
};

// Método adicional para eliminar imágenes específicas
exports.eliminarImagen = async (req, res) => {
  try {
    const { propiedadId, imagenUrl } = req.params;

    // Verificar si es la imagen principal
    const propiedad = await db('propiedades')
      .where({ id: propiedadId })
      .first();

    if (propiedad.imagen_url === imagenUrl) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la imagen principal desde este endpoint' 
      });
    }

    // Eliminar de la base de datos
    await db('propiedad_imagenes')
      .where({ 
        propiedad_id: propiedadId,
        url: imagenUrl 
      })
      .del();

    // Eliminar archivo físico
    const filename = path.basename(imagenUrl);
    const filePath = path.join(__dirname, '../uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Imagen eliminada exitosamente' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: 'Error al eliminar imagen',
      details: process.env.NODE_ENV === "development" ? err.message : null
    });
  }
};