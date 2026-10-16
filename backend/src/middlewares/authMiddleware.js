import jwt from 'jsonwebtoken';

// Exige um token JWT válido e coloca os dados do usuário em req.usuario.
export function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
}

// Restringe a rota aos papéis informados (use depois de autenticarToken).
export function exigePapel(...papeis) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }
    if (!papeis.includes(req.usuario.papel)) {
      return res.status(403).json({ error: 'Acesso negado para o seu perfil.' });
    }
    next();
  };
}
