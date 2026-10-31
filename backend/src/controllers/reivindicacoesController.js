import pool from '../config/db.js';

// POST /api/reivindicacoes  (aluno) — "esse item é meu"
export async function criarReivindicacao(req, res) {
  const { item_achado_id, relato_perda_id, mensagem } = req.body;
  if (!item_achado_id) return res.status(400).json({ error: 'Informe o item.' });
  try {
    const item = await pool.query('SELECT status FROM itens_achados WHERE id = $1', [item_achado_id]);
    if (!item.rows.length) return res.status(404).json({ error: 'Item não encontrado.' });
    if (['DEVOLVIDO', 'DESCARTADO'].includes(item.rows[0].status)) {
      return res.status(409).json({ error: 'Este item não está mais disponível para reivindicação.' });
    }
    const dup = await pool.query(
      `SELECT 1 FROM reivindicacoes WHERE usuario_id = $1 AND item_achado_id = $2 AND status = 'PENDENTE'`,
      [req.usuario.id, item_achado_id]
    );
    if (dup.rowCount) return res.status(409).json({ error: 'Você já tem uma solicitação pendente para este item.' });

    const { rows } = await pool.query(
      `INSERT INTO reivindicacoes (usuario_id, item_achado_id, relato_perda_id, mensagem)
       VALUES ($1, $2, $3, $4) RETURNING id, status`,
      [req.usuario.id, item_achado_id, relato_perda_id || null, (mensagem || '').trim() || null]
    );
    return res.status(201).json({ mensagem: 'Solicitação enviada. A equipe vai analisar.', reivindicacao: rows[0] });
  } catch (err) {
    console.error('Erro ao criar reivindicação:', err);
    return res.status(500).json({ error: 'Erro ao enviar a solicitação.' });
  }
}

// GET /api/reivindicacoes/minhas  (aluno)
export async function minhasReivindicacoes(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.status, r.mensagem, r.criado_em,
              i.id AS item_id, i.codigo AS item_codigo, i.titulo AS item_titulo
       FROM reivindicacoes r
       JOIN itens_achados i ON i.id = r.item_achado_id
       WHERE r.usuario_id = $1
       ORDER BY r.criado_em DESC`,
      [req.usuario.id]
    );
    return res.json(rows.map((r) => ({
      id: r.id, status: r.status, mensagem: r.mensagem, criado_em: r.criado_em,
      item: { id: r.item_id, codigo: r.item_codigo, titulo: r.item_titulo },
    })));
  } catch (err) {
    console.error('Erro ao listar minhas reivindicações:', err);
    return res.status(500).json({ error: 'Erro ao carregar suas solicitações.' });
  }
}

// GET /api/reivindicacoes?status=  (staff)
export async function listarReivindicacoes(req, res) {
  const status = req.query.status || 'PENDENTE';
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.status, r.mensagem, r.criado_em, r.caso_id,
              u.nome AS usuario_nome, u.email AS usuario_email,
              i.id AS item_id, i.codigo AS item_codigo, i.titulo AS item_titulo,
              rp.id AS relato_id, rp.codigo AS relato_codigo, rp.titulo AS relato_titulo
       FROM reivindicacoes r
       JOIN usuarios u       ON u.id = r.usuario_id
       JOIN itens_achados i  ON i.id = r.item_achado_id
       LEFT JOIN relatos_perda rp ON rp.id = r.relato_perda_id
       WHERE ($1 = '' OR r.status = $1)
       ORDER BY r.criado_em DESC`,
      [status]
    );
    return res.json(rows.map((r) => ({
      id: r.id, status: r.status, mensagem: r.mensagem, criado_em: r.criado_em, caso_id: r.caso_id,
      usuario: { nome: r.usuario_nome, email: r.usuario_email },
      item: { id: r.item_id, codigo: r.item_codigo, titulo: r.item_titulo },
      relato: r.relato_id ? { id: r.relato_id, codigo: r.relato_codigo, titulo: r.relato_titulo } : null,
    })));
  } catch (err) {
    console.error('Erro ao listar reivindicações:', err);
    return res.status(500).json({ error: 'Erro ao listar solicitações.' });
  }
}

// POST /api/reivindicacoes/:id/aprovar  (staff) — abre um caso ligando item + relato
export async function aprovarReivindicacao(req, res) {
  const { id } = req.params;
  const staffId = req.usuario ? req.usuario.id : null;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sres = await client.query('SELECT * FROM reivindicacoes WHERE id = $1 FOR UPDATE', [id]);
    if (!sres.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Solicitação não encontrada.' }); }
    const s = sres.rows[0];
    if (s.status !== 'PENDENTE') { await client.query('ROLLBACK'); return res.status(409).json({ error: 'Solicitação já foi decidida.' }); }

    // cria o caso (item + relato), com código único
    const ano = new Date().getFullYear();
    let casoId = null;
    for (let t = 0; t < 5; t++) {
      const { rows: cnt } = await client.query(`SELECT COUNT(*)::int AS n FROM casos WHERE codigo LIKE $1`, [`CASO-${ano}-%`]);
      const codigo = `CASO-${ano}-${String(cnt[0].n + 1 + t).padStart(4, '0')}`;
      try {
        const { rows } = await client.query(
          `INSERT INTO casos (codigo, item_achado_id, relato_perda_id, responsavel_id, status, descricao, criado_por)
           VALUES ($1, $2, $3, $4, 'ABERTO', $5, $4) RETURNING id`,
          [codigo, s.item_achado_id, s.relato_perda_id, staffId, s.mensagem || 'Aberto a partir de reivindicação do usuário.']
        );
        casoId = rows[0].id; break;
      } catch (e) {
        if (e.code === '23505' && t < 4) continue;
        throw e;
      }
    }
    if (!casoId) { await client.query('ROLLBACK'); return res.status(500).json({ error: 'Não foi possível gerar o caso.' }); }

    await client.query(
      `UPDATE reivindicacoes SET status='APROVADA', caso_id=$1, decidido_por=$2, decidido_em=now() WHERE id=$3`,
      [casoId, staffId, id]
    );
    await client.query('COMMIT');
    return res.json({ mensagem: 'Reivindicação aprovada e caso aberto.', caso_id: casoId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao aprovar reivindicação:', err);
    return res.status(500).json({ error: 'Erro ao aprovar a solicitação.' });
  } finally {
    client.release();
  }
}

// POST /api/reivindicacoes/:id/rejeitar  (staff)
export async function rejeitarReivindicacao(req, res) {
  const { id } = req.params;
  const staffId = req.usuario ? req.usuario.id : null;
  try {
    const { rowCount } = await pool.query(
      `UPDATE reivindicacoes SET status='REJEITADA', decidido_por=$1, decidido_em=now()
        WHERE id=$2 AND status='PENDENTE'`,
      [staffId, id]
    );
    if (!rowCount) return res.status(409).json({ error: 'Solicitação não encontrada ou já decidida.' });
    return res.json({ mensagem: 'Solicitação rejeitada.' });
  } catch (err) {
    console.error('Erro ao rejeitar reivindicação:', err);
    return res.status(500).json({ error: 'Erro ao rejeitar a solicitação.' });
  }
}
