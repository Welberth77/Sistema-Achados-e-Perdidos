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

// PUT /api/registradores/:id  (staff)
export async function atualizarRegistrador(req, res) {
  const { id } = req.params;
  const { nome, vinculo, matricula, tipo_documento, documento, telefone, email, observacoes } = req.body;
  if (!nome || !String(nome).trim()) return res.status(400).json({ error: 'Informe o nome.' });
  if (!vinculo) return res.status(400).json({ error: 'Informe o vínculo.' });
  try {
    if (req.usuario.papel !== 'ADMINISTRADOR') {
      const dono = await pool.query('SELECT email FROM registradores WHERE id = $1', [id]);
      if (dono.rows.length && dono.rows[0].email && dono.rows[0].email === req.usuario.email) {
        return res.status(403).json({ error: 'Você não pode alterar o seu próprio registrador. Peça a um administrador.' });
      }
    }
    const { rows } = await pool.query(
      `UPDATE registradores SET
         nome=$1, vinculo=$2, matricula=$3, tipo_documento=$4, documento=$5,
         telefone=$6, email=$7, observacoes=$8, atualizado_em=now()
       WHERE id=$9
       RETURNING id, nome, vinculo, matricula, tipo_documento, documento, telefone, email, observacoes`,
      [String(nome).trim(), vinculo, matricula || null, tipo_documento || null, documento || null, telefone || null, email || null, observacoes || null, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Registrador não encontrado.' });
    return res.json(mapReg(rows[0]));
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Já existe um registrador com esse documento.' });
    console.error('Erro ao atualizar registrador:', err);
    return res.status(500).json({ error: 'Erro ao atualizar o registrador.' });
  }
}

// DELETE /api/registradores/:id  (staff)
export async function excluirRegistrador(req, res) {
  try {
    if (req.usuario.papel !== 'ADMINISTRADOR') {
      const dono = await pool.query('SELECT email FROM registradores WHERE id = $1', [req.params.id]);
      if (dono.rows.length && dono.rows[0].email && dono.rows[0].email === req.usuario.email) {
        return res.status(403).json({ error: 'Você não pode excluir o seu próprio registrador. Peça a um administrador.' });
      }
    }
    const { rowCount } = await pool.query('DELETE FROM registradores WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Registrador não encontrado.' });
    return res.status(204).end();
  } catch (err) {
    if (err.code === '23503') return res.status(409).json({ error: 'Não é possível excluir: há itens ou relatos vinculados a este registrador.' });
    console.error('Erro ao excluir registrador:', err);
    return res.status(500).json({ error: 'Erro ao excluir o registrador.' });
  }
}

// GET /api/registradores/:id  (staff)
export async function obterRegistrador(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, vinculo, matricula, tipo_documento, documento, telefone, email, observacoes
       FROM registradores WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Registrador não encontrado.' });
    return res.json(mapReg(rows[0]));
  } catch (err) {
    console.error('Erro ao obter registrador:', err);
    return res.status(500).json({ error: 'Erro ao carregar o registrador.' });
  }
}
