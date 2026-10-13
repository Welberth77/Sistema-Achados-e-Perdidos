import 'dotenv/config';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado no .env');
}

const router = Router();

const camposUsuario = `
  id, nome, email, papel, ativo, criado_em, atualizado_em
`;

function negarAcesso(res) {
  return res.status(401).json({
    error: {
      code: 'UNAUTHORIZED',
      message: 'Credenciais ou token inválidos.',
      details: [],
    },
  });
}

export async function autenticar(req, res, next) {
  const cabecalho = req.get('Authorization') || '';
  const correspondencia = /^Bearer\s+(\S+)$/i.exec(cabecalho);

  if (!correspondencia) return negarAcesso(res);

  let dados;

  try {
    dados = jwt.verify(correspondencia[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return negarAcesso(res);
  }

  if (typeof dados !== 'object' || typeof dados.sub !== 'string' || !/^[1-9]\d*$/.test(dados.sub)) {
    return negarAcesso(res);
  }

  try {
    const resultado = await pool.query(
      `SELECT ${camposUsuario}
       FROM usuarios
       WHERE id = $1 AND ativo = TRUE`,
      [dados.sub]
    );

    if (!resultado.rows.length) return negarAcesso(res);

    req.user = resultado.rows[0];
    return next();
  } catch (erro) {
    return next(erro);
  }
}

router.post('/login', async (req, res, next) => {
  const { email, senha } = req.body || {};

  if (typeof email !== 'string' || !email.trim() || typeof senha !== 'string' || !senha) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Informe email e senha.',
        details: [],
      },
    });
  }

  try {
    const resultado = await pool.query(
      `SELECT ${camposUsuario}, senha_hash
       FROM usuarios
       WHERE email = $1`,
      [email.trim()]
    );

    const usuario = resultado.rows[0];

    if (!usuario || !usuario.ativo || !(await bcrypt.compare(senha, usuario.senha_hash))) {
      return negarAcesso(res);
    }

    const token = jwt.sign({}, process.env.JWT_SECRET, {
      subject: String(usuario.id),
      algorithm: 'HS256',
      expiresIn: '8h',
    });

    const usuarioPublico = { ...usuario };
    delete usuarioPublico.senha_hash;

    return res.json({ token, usuario: usuarioPublico });
  } catch (erro) {
    return next(erro);
  }
});

router.get('/me', autenticar, (req, res) => {
  res.json(req.user);
});

export default router;
