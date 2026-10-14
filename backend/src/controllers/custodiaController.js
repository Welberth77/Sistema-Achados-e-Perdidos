import pool from '../config/db.js';

export async function registrarCustodia(req, res) {
  const { item_id, localizacao, observacao } = req.body;
  const usuario_id = req.usuario ? req.usuario.id : null;

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

export async function transferirCustodia(req, res) {
  const { id } = req.params;
  const { nova_localizacao, observacao } = req.body;
  const usuario_id = req.usuario ? req.usuario.id : null;

  if (!nova_localizacao) {
    return res.status(400).json({ error: 'A nova localização é obrigatória para transferência.' });
  }

  try {
    const historiaQuery = `
      INSERT INTO custodia_historico (item_id, usuario_id, localizacao, observacao, data_movimentacao)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    const historiaResult = await pool.query(historiaQuery, [
      id,
      usuario_id,
      nova_localizacao,
      observacao || 'Transferência de custódia'
    ]);

    return res.status(200).json({
      mensagem: 'Custódia transferida com sucesso.',
      custodia: historiaResult.rows[0]
    });
  } catch (err) {
    console.error('Erro ao transferir custódia:', err);
    return res.status(500).json({ error: 'Erro interno ao transferir custódia.' });
  }
}

export async function obterHistoricoCustodia(req, res) {
  const { id } = req.params;

  try {
    const query = 'SELECT * FROM custodia_historico WHERE item_id = $1 ORDER BY data_movimentacao DESC';
    const result = await pool.query(query, [id]);

    return res.json({
      item_id: id,
      historico: result.rows
    });
  } catch (err) {
    console.error('Erro ao buscar histórico de custódia:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar histórico.' });
  }
}