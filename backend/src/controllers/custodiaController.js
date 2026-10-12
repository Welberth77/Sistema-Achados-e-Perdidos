import pool from '../config/db.js';

export async function registrarCustodia(req, res) {
  const { item_id, localizacao, observacao } = req.body;
  const usuario_id = req.usuario.id;

  if (!item_id || !localizacao) {
    return res.status(400).json({ error: 'ID do item e localização são obrigatórios.' });
  }

  try {
    const itemQuery = `
      UPDATE itens 
      SET status = 'EM_CUSTODIA', atualizado_em = NOW() 
      WHERE id = $1 RETURNING *
    `;
    const itemResult = await pool.query(itemQuery, [item_id]);

    if (itemResult.rowCount === 0) {
      return res.status(404).json({ error: 'Item não encontrado.' });
    }

    const historiaQuery = `
      INSERT INTO custodia_historico (item_id, usuario_id, localizacao, observacao, data_movimentacao)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    const historiaResult = await pool.query(historiaQuery, [
      item_id,
      usuario_id,
      localizacao,
      observacao || 'Entrada em custódia'
    ]);

    return res.status(201).json({
      mensagem: 'Item colocado em custódia com sucesso.',
      item: itemResult.rows[0],
      custodia: historiaResult.rows[0]
    });
  } catch (err) {
    console.error('Erro ao registrar custódia:', err);
    return res.status(500).json({ error: 'Erro interno ao processar custódia.' });
  }
}