import pool from '../config/db.js';

// GET /api/solicitacoes?status=  (admin)
export async function listarSolicitacoes(req, res) {
  const status = req.query.status || '';
  try {
    const { rows } = await pool.query(
      `SELECT s.id, s.usuario_id, s.status, s.vinculo, s.matricula, s.tipo_documento,
              s.documento, s.telefone, s.observacoes, s.criado_em,
              u.nome AS usuario_nome, u.email AS usuario_email
       FROM solicitacoes_registrador s
       JOIN usuarios u ON u.id = s.usuario_id
       WHERE ($1 = '' OR s.status = $1)
       ORDER BY s.criado_em DESC`,
      [status]
    );
    return res.json(rows.map((r) => ({
      id: r.id,
      usuario_id: r.usuario_id,
      status: r.status,
      vinculo: r.vinculo,
      matricula: r.matricula,
      tipo_documento: r.tipo_documento,
      documento: r.documento,
      telefone: r.telefone,
      observacoes: r.observacoes,
      criado_em: r.criado_em,
      usuario: { id: r.usuario_id, nome: r.usuario_nome, email: r.usuario_email },
    })));
  } catch (err) {
    console.error('Erro ao listar solicitações:', err);
    return res.status(500).json({ error: 'Erro ao listar solicitações.' });
  }
}

// POST /api/solicitacoes/:id/aprovar  (admin)
export async function aprovarSolicitacao(req, res) {
  const { id } = req.params;
  const adminId = req.usuario ? req.usuario.id : null;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sres = await client.query('SELECT * FROM solicitacoes_registrador WHERE id = $1 FOR UPDATE', [id]);
    if (!sres.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Solicitação não encontrada.' });
    }
    const s = sres.rows[0];
    if (s.status !== 'PENDENTE') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Solicitação já foi decidida.' });
    }
    const u = await client.query('SELECT nome, email FROM usuarios WHERE id = $1', [s.usuario_id]);
    if (!u.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    const { nome, email } = u.rows[0];

    await client.query(`UPDATE usuarios SET papel = 'SERVIDOR', atualizado_em = now() WHERE id = $1`, [s.usuario_id]);

    const ex = email
      ? await client.query('SELECT id FROM registradores WHERE email = $1 ORDER BY id LIMIT 1', [email])
      : { rows: [] };
    if (ex.rows.length) {
      await client.query(
        `UPDATE registradores SET nome=$1, vinculo=$2, matricula=$3, tipo_documento=$4,
                documento=$5, telefone=$6, observacoes=$7, atualizado_em=now()
         WHERE id=$8`,
        [nome, s.vinculo, s.matricula, s.tipo_documento, s.documento, s.telefone, s.observacoes, ex.rows[0].id]
      );
    } else {
      await client.query(
        `INSERT INTO registradores (nome, vinculo, matricula, tipo_documento, documento, telefone, email, observacoes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [nome, s.vinculo, s.matricula, s.tipo_documento, s.documento, s.telefone, email, s.observacoes]
      );
    }

    await client.query(
      `UPDATE solicitacoes_registrador SET status='APROVADA', decidido_por=$1, decidido_em=now() WHERE id=$2`,
      [adminId, id]
    );
    await client.query('COMMIT');
    return res.json({ mensagem: 'Solicitação aprovada. O usuário é agora servidor/registrador.' });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ error: 'Documento já cadastrado para outro registrador.' });
    console.error('Erro ao aprovar solicitação:', err);
    return res.status(500).json({ error: 'Erro ao aprovar a solicitação.' });
  } finally {
    client.release();
  }
}

// POST /api/solicitacoes/:id/rejeitar  (admin)
export async function rejeitarSolicitacao(req, res) {
  const { id } = req.params;
  const adminId = req.usuario ? req.usuario.id : null;
  try {
    const { rowCount } = await pool.query(
      `UPDATE solicitacoes_registrador SET status='REJEITADA', decidido_por=$1, decidido_em=now()
        WHERE id=$2 AND status='PENDENTE'`,
      [adminId, id]
    );
    if (!rowCount) return res.status(409).json({ error: 'Solicitação não encontrada ou já decidida.' });
    return res.json({ mensagem: 'Solicitação rejeitada.' });
  } catch (err) {
    console.error('Erro ao rejeitar solicitação:', err);
    return res.status(500).json({ error: 'Erro ao rejeitar a solicitação.' });
  }
}
