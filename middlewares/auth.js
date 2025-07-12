const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token requerido' });

  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = payload;          // ahora req.user.id es el ID del usuario
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
