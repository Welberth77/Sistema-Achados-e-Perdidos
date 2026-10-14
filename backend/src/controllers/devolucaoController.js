import pool from '../config/db.js';

export async function registrarDevolucao(req, res) {
  const { item_id, comprovante, observacao } = req.body;
  const usuario_id = req.usuario ? req.usuario.id : null;

  // Validação estrita da regra de negócio (UC-06)
  if (!item_id || !comprovante || typeof comprovante !== 'string' || comprovante.trim() === '') {
    return res.status(422).json({
      error: 'Devolução bloqueada: É obrigatório fornecer a comprovação de propriedade válida.'
    });
  }

  try {
    // 1. Atualiza o estado do item para DEVOLVIDO
    const itemQuery = `
      UPDATE itens 
      SET status = 'DEVOLVIDO', atualizado_em = NOW() 
      WHERE id = $1 RETURNING *
    `;
    const itemResult = await pool.query(itemQuery, [item_id]);

    if (itemResult.rowCount === 0) {
      return res.status(404).json({ error: 'Item não encontrado.' });
    }

    // 2. Regista a devolução na tabela de histórico/devoluções
    const devolucaoQuery = `
      INSERT INTO devolucoes (item_id, usuario_id, comprovante, observacao, data_devolucao)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    const devolucaoResult = await pool.query(devolucaoQuery, [
      item_id,
      usuario_id,
      comprovante.trim(),
      observacao || 'Devolução finalizada com sucesso'
    ]);

    return res.status(200).json({
      mensagem: 'Item devolvido com sucesso.',
      item: itemResult.rows[0],
      devolucao: devolucaoResult.rows[0]
    });
  } catch (err) {
    console.error('Erro ao registrar devolução:', err);
    return res.status(500).json({ error: 'Erro interno ao processar a devolução.' });
  }
}