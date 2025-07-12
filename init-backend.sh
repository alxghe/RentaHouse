/// ESTRUCTURA GENERAL DEL BACKEND DE LA PLATAFORMA DE RENTAS ///

// Script para crear estructura del backend y archivos con contenido base

// 1. Guarda este contenido como "init-backend.sh"
// 2. Ejecuta en la terminal:
// chmod +x init-backend.sh && ./init-backend.sh

#!/bin/bash

mkdir backend-rentas
cd backend-rentas || exit

npm init -y
npm install express knex sqlite3 cors dotenv bcrypt jsonwebtoken
npm install --save-dev nodemon

mkdir db routes controllers middlewares migrations models

# Archivos raíz
cat > index.js <<EOF
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/users', require('./routes/users'));
app.use('/api/propiedades', require('./routes/propiedades'));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto \${PORT}`);
});
EOF

cat > knexfile.js <<EOF
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './db/database.sqlite'
    },
    useNullAsDefault: true
  }
};
EOF

echo -e "PORT=3000\nJWT_SECRET=secreto_super_seguro" > .env

# Base de datos
cat > db/connection.js <<EOF
const knex = require('knex');
const config = require('../knexfile');
const db = knex(config.development);
module.exports = db;
EOF

# Rutas
cat > routes/users.js <<EOF
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.post('/register', usersController.register);
router.post('/login', usersController.login);

module.exports = router;
EOF

cat > routes/propiedades.js <<EOF
const express = require('express');
const router = express.Router();
const propiedadesController = require('../controllers/propiedadesController');

router.get('/', propiedadesController.listar);
router.post('/', propiedadesController.crear);
router.get('/:id', propiedadesController.obtener);
router.put('/:id', propiedadesController.actualizar);
router.delete('/:id', propiedadesController.eliminar);

module.exports = router;
EOF

# Controladores
cat > controllers/usersController.js <<EOF
const db = require('../db/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
EOF

cat > controllers/propiedadesController.js <<EOF
const db = require('../db/connection');

exports.listar = async (req, res) => {
  try {
    const propiedades = await db('propiedades');
    res.json(propiedades);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar propiedades' });
  }
};

exports.crear = async (req, res) => {
  try {
    const [id] = await db('propiedades').insert(req.body);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear propiedad', details: err });
  }
};

exports.obtener = async (req, res) => {
  try {
    const propiedad = await db('propiedades').where({ id: req.params.id }).first();
    res.json(propiedad);
  } catch (err) {
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
EOF

# Middleware vacío
cat > middlewares/auth.js <<EOF
// Middleware para proteger rutas con JWT (a implementar)
EOF

echo "✅ Estructura con archivos base generada correctamente."
