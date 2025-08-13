const db = require('../db/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getUserInfo = async (req, res) => {
  try {
    // El middleware ya validó el token y añadió req.user con { id, rol }
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id', 'nombre', 'apellido', 'email', 'telefono', 'rol', 'verificado')
      .first();

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Devuelve información segura del usuario (sin password)
    res.json({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
      verificado: user.verificado
    });
  } catch (err) {
    console.error('Error al obtener información del usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Función específica para obtener solo el ID (más ligera)
exports.getUserId = (req, res) => {
  // Simplemente devuelve el ID que ya está en req.user del middleware
  res.json({ id: req.user.id });
};

exports.register = async (req, res) => {
  const { nombre, apellido, email, password, telefono, rol } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [id] = await db('users').insert({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      telefono,
      rol,
      verificado: false,
      created_at: new Date()
    });
    res.status(201).json({ id, message: 'Usuario registrado' });
  } catch (err) {
        console.error(err); 
    res.status(500).json({ error: 'Error al registrar', details: err });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db('users').where({ email }).first();
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });
    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión', details: err });
  }
};
