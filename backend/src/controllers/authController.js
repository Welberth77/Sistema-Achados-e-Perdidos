import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Domínios de e-mail aceitos no autocadastro (espelha o front em utils/validacao.js).
const DOMINIOS_EMAIL = [
  'gmail.com', 'hotmail.com', 'hotmail.com.br', 'outlook.com', 'outlook.com.br',
  'yahoo.com', 'yahoo.com.br', 'live.com', 'icloud.com', 'proton.me',
  'protonmail.com', 'bol.com.br', 'uol.com.br', 'terra.com.br', 'alunos.afya.com.br'
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailPermitido(email) {
  const e = String(email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(e)) return false;
  return DOMINIOS_EMAIL.includes(e.split('@')[1]);
}

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, papel: usuario.papel },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = resultado.rows[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    return res.json({
      mensagem: 'Login realizado com sucesso',
      token: gerarToken(usuario),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
      },
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro interno no servidor ao realizar login.' });
  }
}

// Autocadastro de usuário comum (aluno/docente): sempre nasce com papel USUARIO.
export async function registrar(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }
  if (!emailPermitido(email)) {
    return res.status(400).json({
      error: 'Use um e-mail de um provedor válido (ex.: @gmail.com, @hotmail.com, @outlook.com).',
    });
  }
  if (String(senha).length < 6) {
    return res.status(400).json({ error: 'A senha deve ter ao menos 6 caracteres.' });
  }

  try {
    const existe = await pool.query('SELECT 1 FROM usuarios WHERE email = $1', [email]);
    if (existe.rowCount > 0) {
      return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, papel)
       VALUES ($1, $2, $3, 'USUARIO')
       RETURNING id, nome, email, papel`,
      [nome, email, senha_hash]
    );
    const usuario = result.rows[0];

    return res.status(201).json({
      mensagem: 'Conta criada com sucesso',
      token: gerarToken(usuario),
      usuario,
    });
  } catch (err) {
    if (err.code === '23505') {
      // violação de UNIQUE(email) — caso duas requisições corram juntas
      return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' });
    }
    console.error('Erro no cadastro:', err);
    return res.status(500).json({ error: 'Erro interno ao criar a conta.' });
  }
}
