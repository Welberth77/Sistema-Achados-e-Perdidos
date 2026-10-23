import pool from '../config/db.js';

const TIPOS = ['ENTRADA', 'TRANSFERENCIA', 'SAIDA'];

// POST /api/custodia/nova — registra uma movimentação de custódia (UC-05).
export async function registrarCustodia(req, res) {
  const { item_id, tipo = 'ENTRADA', local_guarda, observacoes } = req.body;
  const usuario_id = req.usuario ? req.usuario.id : null;

  if (!item_id || !local_guarda || !String(local_guarda).trim()) {
    return res.status(422).json({ error: 'Informe o item e o local de guarda.' });
  }
  if (!TIPOS.includes(tipo)) {
    return res.status(422).json({ error: 'Tipo de custódia inválido.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existe = await client.query('SELECT id FROM itens_achados WHERE id = $1', [item_id]);
    if (existe.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Item não encontrado.' });
    }

    const custodia = await client.query(
      `INSERT INTO custodias
          (item_achado_id, tipo, usuario_id, local_guarda, observacoes, criado_por)
       VALUES ($1, $2, $3, $4, $5, $3)
       RETURNING *`,
      [item_id, tipo, usuario_id, String(local_guarda).trim(), observacoes || null]
    );

    // Entrada e transferência deixam o item EM_CUSTODIA; saída não altera o status aqui.
    if (tipo !== 'SAIDA') {
      await client.query(
        `UPDATE itens_achados SET status = 'EM_CUSTODIA', atualizado_em = NOW() WHERE id = $1`,
        [item_id]
      );
    }

    await client.query('COMMIT');
    return res.status(201).json({
      mensagem: 'Movimentação de custódia registrada.',
      custodia: custodia.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23503' || err.code === '23514') {
      return res.status(422).json({ error: 'Dados inválidos para a custódia.' });
    }
    console.error('Erro ao registrar custódia:', err);
    return res.status(500).json({ error: 'Erro interno ao processar custódia.' });
  } finally {
    client.release();
  }
}

// PUT /api/custodia/:id/transferir — :id é o id do item.
export async function transferirCustodia(req, res) {
  const { id } = req.params;
  const { nova_localizacao, local_guarda, observacoes } = req.body;
  const destino = nova_localizacao || local_guarda;
  const usuario_id = req.usuario ? req.usuario.id : null;

  if (!destino || !String(destino).trim()) {
    return res.status(422).json({ error: 'Informe o novo local de guarda.' });
  }

  try {
    const existe = await pool.query('SELECT id FROM itens_achados WHERE id = $1', [id]);
    if (existe.rowCount === 0) {
      return res.status(404).json({ error: 'Item não encontrado.' });
    }
    const custodia = await pool.query(
      `INSERT INTO custodias
          (item_achado_id, tipo, usuario_id, local_guarda, observacoes, criado_por)
       VALUES ($1, 'TRANSFERENCIA', $2, $3, $4, $2)
       RETURNING *`,
      [id, usuario_id, String(destino).trim(), observacoes || null]
    );
    return res.status(200).json({
      mensagem: 'Custódia transferida com sucesso.',
      custodia: custodia.rows[0],
    });
  } catch (err) {
    console.error('Erro ao transferir custódia:', err);
    return res.status(500).json({ error: 'Erro interno ao transferir custódia.' });
  }
}

// GET /api/custodia/:id/historico — :id é o id do item.
export async function obterHistoricoCustodia(req, res) {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT cu.id, cu.tipo, cu.local_guarda, cu.observacoes, cu.data_evento,
              u.nome AS usuario
         FROM custodias cu
         LEFT JOIN usuarios u ON u.id = cu.usuario_id
        WHERE cu.item_achado_id = $1
        ORDER BY cu.data_evento DESC`,
      [id]
    );
    return res.json({ item_id: id, historico: rows });
  } catch (err) {
    console.error('Erro ao buscar histórico de custódia:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar histórico.' });
  }
}
