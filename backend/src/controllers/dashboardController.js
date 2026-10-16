import pool from '../config/db.js';

// Resumo com números reais para o painel da equipe.
export async function resumo(req, res) {
  try {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM itens_achados)                                   AS itens_achados,
        (SELECT COUNT(*) FROM itens_achados WHERE status = 'EM_CUSTODIA')       AS em_custodia,
        (SELECT COUNT(*) FROM itens_achados WHERE status = 'DEVOLVIDO')         AS devolvidos,
        (SELECT COUNT(*) FROM casos WHERE status NOT IN ('ENCERRADO','CANCELADO')) AS casos_abertos,
        (SELECT COUNT(*) FROM casos WHERE status = 'ENCERRADO')                 AS casos_encerrados
    `;
    const { rows } = await pool.query(sql);
    const r = rows[0];
    return res.json({
      itens_achados: Number(r.itens_achados),
      em_custodia: Number(r.em_custodia),
      devolvidos: Number(r.devolvidos),
      casos_abertos: Number(r.casos_abertos),
      casos_encerrados: Number(r.casos_encerrados),
    });
  } catch (err) {
    console.error('Erro no resumo do dashboard:', err);
    return res.status(500).json({ error: 'Erro ao carregar o resumo.' });
  }
}
