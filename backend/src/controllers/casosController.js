import pool from '../config/db.js';

export async function obterCasoConsolidado(req, res) {
  const { id } = req.params;

  try {
    // Procura o item
    const itemQuery = 'SELECT * FROM itens WHERE id = $1';
    const itemRes = await pool.query(itemQuery, [id]);

    if (itemRes.rowCount === 0) {
      return res.status(404).json({ error: 'Caso/Item não encontrado.' });
    }

    // Procura o histórico de custódia
    const custodiaQuery = 'SELECT * FROM custodia_historico WHERE item_id = $1 ORDER BY data_movimentacao DESC';
    const custodiaRes = await pool.query(custodiaQuery, [id]);

    // Procura registo de devolução (se houver)
    const devolucaoQuery = 'SELECT * FROM devolucoes WHERE item_id = $1';
    const devolucaoRes = await pool.query(devolucaoQuery, [id]);

    return res.json({
      caso: itemRes.rows[0],
      historico_custodia: custodiaRes.rows,
      devolucao: devolucaoRes.rows[0] || null
    });
  } catch (err) {
    console.error('Erro ao buscar visão consolidada do caso:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar caso.' });
  }
}

export async function encerrarCaso(req, res) {
  const { id } = req.params;
  const { motivo_encerramento } = req.body;

  try {
    const updateQuery = `
      UPDATE itens 
      SET status = 'ENCERRADO', observacao = $1, atualizado_em = NOW() 
      WHERE id = $2 RETURNING *
    `;
    const result = await pool.query(updateQuery, [motivo_encerramento || 'Caso encerrado manualmente', id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Caso/Item não encontrado.' });
    }

    return res.json({
      mensagem: 'Caso encerrado com sucesso.',
      caso: result.rows[0]
    });
  } catch (err) {
    console.error('Erro ao encerrar caso:', err);
    return res.status(500).json({ error: 'Erro interno ao encerrar caso.' });
  }
}