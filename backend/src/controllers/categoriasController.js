import pool from '../config/db.js';

// GET /api/categorias — lista usada nos selects de cadastro/consulta.
export async function listarCategorias(req, res) {
  try {
    const { rows } = await pool.query(`SELECT id, nome FROM categorias ORDER BY nome`);
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao listar categorias:', err);
    return res.status(500).json({ error: 'Erro ao listar categorias.' });
  }
}
