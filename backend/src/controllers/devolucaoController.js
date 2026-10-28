import pool from '../config/db.js';

// Registra a devolução de um item achado ao seu proprietário/recebedor.
// Regra de negócio (UC-06): não devolve sem comprovação de propriedade.
export async function registrarDevolucao(req, res) {
  const { item_id, recebedor_id, comprovante, observacao } = req.body;
  const usuario_id = req.usuario ? req.usuario.id : null;

  // Regra de negócio: a comprovação de propriedade é obrigatória.
  if (!comprovante || typeof comprovante !== 'string' || comprovante.trim() === '') {
    return res.status(422).json({
      error: 'Devolução bloqueada: é obrigatório fornecer a comprovação de propriedade.',
    });
  }
  if (!item_id) {
    return res.status(422).json({ error: 'Informe o item a ser devolvido (item_id).' });
  }
  if (!recebedor_id) {
    return res.status(422).json({ error: 'Informe quem está recebendo o item (recebedor_id).' });
  }

  // A tabela devolucoes não tem coluna de observação; guardamos tudo na comprovação.
  const descricao =
    observacao && String(observacao).trim()
      ? `${comprovante.trim()} | Obs: ${String(observacao).trim()}`
      : comprovante.trim();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Marca o item como DEVOLVIDO (tabela correta: itens_achados).
    const itemResult = await client.query(
      `UPDATE itens_achados
          SET status = 'DEVOLVIDO', atualizado_em = NOW()
        WHERE id = $1
        RETURNING *`,
      [item_id]
    );

    if (itemResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Item não encontrado.' });
    }

    // 2. Registra a devolução concluída, com a comprovação de propriedade.
    //    comprovado = TRUE e status = 'CONCLUIDA' satisfazem os CHECKs do banco.
    const devolucaoResult = await client.query(
      `INSERT INTO devolucoes
          (item_achado_id, recebedor_id, comprovado, comprovacao_descricao,
           status, data_devolucao, autorizado_por, criado_por)
       VALUES ($1, $2, TRUE, $3, 'CONCLUIDA', NOW(), $4, $4)
       RETURNING *`,
      [item_id, recebedor_id, descricao, usuario_id]
    );

    // 3. Encerra casos abertos vinculados a este item (sincroniza o fluxo).
    await client.query(
      `UPDATE casos SET status = 'ENCERRADO', data_encerramento = NOW()
        WHERE item_achado_id = $1 AND status NOT IN ('ENCERRADO','CANCELADO')`,
      [item_id]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      mensagem: 'Item devolvido com sucesso.',
      item: itemResult.rows[0],
      devolucao: devolucaoResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    // FK inválida (item/recebedor inexistente) ou violação de regra do banco.
    if (err.code === '23503' || err.code === '23514') {
      return res.status(422).json({
        error: 'Dados inválidos para a devolução (item ou recebedor inexistente).',
      });
    }
    console.error('Erro ao registrar devolução:', err);
    return res.status(500).json({ error: 'Erro interno ao processar a devolução.' });
  } finally {
    client.release();
  }
}
