import pool from '../config/db.js';

// GET /api/categorias — lista (usada nos selects e na tela de gestão).
export async function listarCategorias(req, res) {
  try {
    const { rows } = await pool.query(`SELECT id, nome, descricao FROM categorias ORDER BY nome`);
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao listar categorias:', err);
    return res.status(500).json({ error: 'Erro ao listar categorias.' });
  }
}

// POST /api/categorias  (staff)
export async function criarCategoria(req, res) {
  const { nome, descricao } = req.body;
  if (!nome || !String(nome).trim()) return res.status(400).json({ error: 'Informe o nome da categoria.' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO categorias (nome, descricao) VALUES ($1, $2) RETURNING id, nome, descricao`,
      [String(nome).trim(), descricao || null]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Já existe uma categoria com esse nome.' });
    console.error('Erro ao criar categoria:', err);
    return res.status(500).json({ error: 'Erro ao criar a categoria.' });
  }
}

// PUT /api/categorias/:id  (staff)
export async function atualizarCategoria(req, res) {
  const { id } = req.params;
  const { nome, descricao } = req.body;
  if (!nome || !String(nome).trim()) return res.status(400).json({ error: 'Informe o nome da categoria.' });
  try {
    const { rows } = await pool.query(
      `UPDATE categorias SET nome=$1, descricao=$2, atualizado_em=now() WHERE id=$3
       RETURNING id, nome, descricao`,
      [String(nome).trim(), descricao || null, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Categoria não encontrada.' });
    return res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Já existe uma categoria com esse nome.' });
    console.error('Erro ao atualizar categoria:', err);
    return res.status(500).json({ error: 'Erro ao atualizar a categoria.' });
  }
}

// DELETE /api/categorias/:id  (staff) — itens/relatos ficam "sem categoria" (ON DELETE SET NULL).
export async function excluirCategoria(req, res) {
  try {
    const { rowCount } = await pool.query('DELETE FROM categorias WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Categoria não encontrada.' });
    return res.status(204).end();
  } catch (err) {
    console.error('Erro ao excluir categoria:', err);
    return res.status(500).json({ error: 'Erro ao excluir a categoria.' });
  }
}
