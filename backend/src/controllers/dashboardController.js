import pool from '../config/db.js';

// Resumo com números reais para o painel da equipe.
export async function resumo(req, res) {
  try {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM itens_achados)                                        AS itens_achados,
        (SELECT COUNT(*) FROM itens_achados WHERE status = 'RECEBIDO')              AS recebidos,
        (SELECT COUNT(*) FROM itens_achados WHERE status = 'EM_CUSTODIA')           AS em_custodia,
        (SELECT COUNT(*) FROM itens_achados WHERE status = 'EM_ANALISE')            AS em_analise,
        (SELECT COUNT(*) FROM itens_achados WHERE status = 'DEVOLVIDO')             AS devolvidos,
        (SELECT COUNT(*) FROM itens_achados WHERE status = 'DESCARTADO')            AS descartados,
        (SELECT COUNT(*) FROM relatos_perda)                                        AS relatos_total,
        (SELECT COUNT(*) FROM relatos_perda WHERE status NOT IN ('ENCERRADO','CANCELADO')) AS relatos_abertos,
        (SELECT COUNT(*) FROM casos WHERE status NOT IN ('ENCERRADO','CANCELADO'))  AS casos_abertos,
        (SELECT COUNT(*) FROM casos WHERE status = 'ENCERRADO')                     AS casos_encerrados,
        (SELECT COUNT(*) FROM usuarios)                                             AS usuarios,
        (SELECT COUNT(*) FROM registradores)                                        AS registradores,
        (SELECT COUNT(*) FROM categorias)                                           AS categorias
    `;
    const { rows } = await pool.query(sql);
    const r = rows[0];
    const n = (x) => Number(x);
    return res.json({
      itens_achados: n(r.itens_achados),
      recebidos: n(r.recebidos),
      em_custodia: n(r.em_custodia),
      em_analise: n(r.em_analise),
      devolvidos: n(r.devolvidos),
      descartados: n(r.descartados),
      relatos_total: n(r.relatos_total),
      relatos_abertos: n(r.relatos_abertos),
      casos_abertos: n(r.casos_abertos),
      casos_encerrados: n(r.casos_encerrados),
      usuarios: n(r.usuarios),
      registradores: n(r.registradores),
      categorias: n(r.categorias),
    });
  } catch (err) {
    console.error('Erro no resumo do dashboard:', err);
    return res.status(500).json({ error: 'Erro ao carregar o resumo.' });
  }
}
