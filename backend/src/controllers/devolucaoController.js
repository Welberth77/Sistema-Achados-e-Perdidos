import pool from '../config/db.js';

// Resolve o recebedor (dono) para um id de registrador, aceitando:
//  - recebedor_usuario_id: um usuário comum (aluno) -> vira/acha um registrador (vinculo ALUNO)
//  - recebedor_nome: pessoa sem conta -> cria um registrador (vinculo OUTRO)
//  - recebedor_id: um registrador já existente (compatibilidade)
async function resolverRecebedor(client, { recebedor_id, recebedor_usuario_id, recebedor_nome }) {
  if (recebedor_id) return recebedor_id;

  if (recebedor_usuario_id) {
    const u = await client.query('SELECT nome, email FROM usuarios WHERE id = $1', [recebedor_usuario_id]);
    if (!u.rows.length) return null;
    const { nome, email } = u.rows[0];
    if (email) {
      const ex = await client.query('SELECT id FROM registradores WHERE email = $1 ORDER BY id LIMIT 1', [email]);
      if (ex.rows.length) return ex.rows[0].id;
    }
    const ins = await client.query(
      `INSERT INTO registradores (nome, vinculo, email) VALUES ($1, 'ALUNO', $2) RETURNING id`,
      [nome, email]
    );
    return ins.rows[0].id;
  }

  if (recebedor_nome && String(recebedor_nome).trim()) {
    const ins = await client.query(
      `INSERT INTO registradores (nome, vinculo) VALUES ($1, 'OUTRO') RETURNING id`,
      [String(recebedor_nome).trim()]
    );
    return ins.rows[0].id;
  }

  return null;
}

// Registra a devolução de um item ao seu dono. Regra (UC-06): exige comprovação de propriedade.
export async function registrarDevolucao(req, res) {
  const { item_id, recebedor_id, recebedor_usuario_id, recebedor_nome, comprovante, observacao } = req.body;
  const usuario_id = req.usuario ? req.usuario.id : null;

  if (!comprovante || typeof comprovante !== 'string' || comprovante.trim() === '') {
    return res.status(422).json({ error: 'Devolução bloqueada: é obrigatório fornecer a comprovação de propriedade.' });
  }
  if (!item_id) {
    return res.status(422).json({ error: 'Informe o item a ser devolvido (item_id).' });
  }
  if (!recebedor_id && !recebedor_usuario_id && !(recebedor_nome && String(recebedor_nome).trim())) {
    return res.status(422).json({ error: 'Informe quem está recebendo o item (o dono).' });
  }

  const descricao =
    observacao && String(observacao).trim()
      ? `${comprovante.trim()} | Obs: ${String(observacao).trim()}`
      : comprovante.trim();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Resolve o dono que está recebendo.
    const recebedorFinal = await resolverRecebedor(client, { recebedor_id, recebedor_usuario_id, recebedor_nome });
    if (!recebedorFinal) {
      await client.query('ROLLBACK');
      return res.status(422).json({ error: 'Recebedor inválido.' });
    }

    // 1. Marca o item como DEVOLVIDO.
    const itemResult = await client.query(
      `UPDATE itens_achados SET status = 'DEVOLVIDO', atualizado_em = NOW() WHERE id = $1 RETURNING *`,
      [item_id]
    );
    if (itemResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Item não encontrado.' });
    }

    // 2. Registra a devolução concluída, com a comprovação.
    const devolucaoResult = await client.query(
      `INSERT INTO devolucoes
          (item_achado_id, recebedor_id, comprovado, comprovacao_descricao,
           status, data_devolucao, autorizado_por, criado_por)
       VALUES ($1, $2, TRUE, $3, 'CONCLUIDA', NOW(), $4, $4)
       RETURNING *`,
      [item_id, recebedorFinal, descricao, usuario_id]
    );

    // 3. Encerra casos abertos vinculados a este item.
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
    if (err.code === '23503' || err.code === '23514') {
      return res.status(422).json({ error: 'Dados inválidos para a devolução.' });
    }
    console.error('Erro ao registrar devolução:', err);
    return res.status(500).json({ error: 'Erro interno ao processar a devolução.' });
  } finally {
    client.release();
  }
}
