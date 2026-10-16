import pool from '../config/db.js';

function mapReg(r) {
  return {
    id: r.id,
    nome: r.nome,
    vinculo: r.vinculo,
    matricula: r.matricula,
    tipo_documento: r.tipo_documento,
    documento: r.documento,
    telefone: r.telefone,
    email: r.email,
    observacoes: r.observacoes,
  };
}

// GET /api/registradores?q=&vinculo=  (staff)
export async function listarRegistradores(req, res) {
  const q = req.query.q || '';
  const vinculo = req.query.vinculo || '';
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, vinculo, matricula, tipo_documento, documento, telefone, email, observacoes
       FROM registradores
       WHERE ($1 = '' OR nome ILIKE '%' || $1 || '%' OR documento ILIKE '%' || $1 || '%' OR matricula ILIKE '%' || $1 || '%')
         AND ($2 = '' OR vinculo = $2)
       ORDER BY nome`,
      [q, vinculo]
    );
    return res.json(rows.map(mapReg));
  } catch (err) {
    console.error('Erro ao listar registradores:', err);
    return res.status(500).json({ error: 'Erro ao listar registradores.' });
  }
}

// POST /api/registradores  (staff)
export async function criarRegistrador(req, res) {
  const { nome, vinculo, matricula, tipo_documento, documento, telefone, email, observacoes } = req.body;
  if (!nome || !String(nome).trim()) return res.status(400).json({ error: 'Informe o nome.' });
  if (!vinculo) return res.status(400).json({ error: 'Informe o vínculo.' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO registradores
         (nome, vinculo, matricula, tipo_documento, documento, telefone, email, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, nome, vinculo, matricula, tipo_documento, documento, telefone, email, observacoes`,
      [String(nome).trim(), vinculo, matricula || null, tipo_documento || null, documento || null, telefone || null, email || null, observacoes || null]
    );
    return res.status(201).json(mapReg(rows[0]));
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Já existe um registrador com esse documento.' });
    console.error('Erro ao criar registrador:', err);
    return res.status(500).json({ error: 'Erro ao cadastrar o registrador.' });
  }
}
