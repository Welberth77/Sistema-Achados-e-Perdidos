import pool from '../config/db.js';

function mapItem(row) {
  return {
    id: row.id,
    codigo: row.codigo,
    titulo: row.titulo,
    descricao: row.descricao,
    local_encontrado: row.local_encontrado,
    data_encontrado: row.data_encontrado,
    status: row.status,
    categoria: row.categoria_nome ? { nome: row.categoria_nome } : null,
  };
}

// GET /api/itens?q=&categoria=&status=  — lista de itens achados (qualquer usuário logado).
export async function listarItens(req, res) {
  const q = req.query.q || '';
  const categoria = req.query.categoria || '';
  const status = req.query.status || '';
  try {
    const sql = `
      SELECT i.id, i.codigo, i.titulo, i.descricao, i.local_encontrado, i.data_encontrado,
             i.status, c.nome AS categoria_nome
      FROM itens_achados i
      LEFT JOIN categorias c ON c.id = i.categoria_id
      WHERE ($1 = '' OR i.titulo ILIKE '%' || $1 || '%' OR i.descricao ILIKE '%' || $1 || '%' OR i.codigo ILIKE '%' || $1 || '%')
        AND ($2 = '' OR c.nome = $2)
        AND ($3 = '' OR i.status = $3)
      ORDER BY i.data_encontrado DESC, i.id DESC
    `;
    const { rows } = await pool.query(sql, [q, categoria, status]);
    return res.json(rows.map(mapItem));
  } catch (err) {
    console.error('Erro ao listar itens:', err);
    return res.status(500).json({ error: 'Erro ao listar itens.' });
  }
}
