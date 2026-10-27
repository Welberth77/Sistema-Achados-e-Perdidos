import pool from '../config/db.js';

// GET /api/publico/itens?categoria=  — catálogo PÚBLICO (sem login).
// Mostra só o mínimo (categoria, local, data) de itens que ainda estão guardados,
// para alguém reconhecer que o item pode estar com o setor. Detalhes exigem login.
export async function listarCatalogoPublico(req, res) {
  const categoria = req.query.categoria || '';
  try {
    const { rows } = await pool.query(
      `SELECT i.id,
              c.nome              AS categoria,
              i.local_encontrado  AS local,
              i.data_encontrado   AS data
       FROM itens_achados i
       LEFT JOIN categorias c ON c.id = i.categoria_id
       WHERE i.status IN ('RECEBIDO', 'EM_CUSTODIA', 'EM_ANALISE', 'EM_DEVOLUCAO')
         AND ($1 = '' OR c.nome = $1)
       ORDER BY i.data_encontrado DESC, i.id DESC`,
      [categoria]
    );
    return res.json(rows);
  } catch (err) {
    console.error('Erro no catálogo público:', err);
    return res.status(500).json({ error: 'Erro ao carregar o catálogo.' });
  }
}
