import pool from '../config/db.js';

// Monta o caso no formato que o frontend espera (item/relato/responsavel aninhados).
function mapCaso(row) {
  return {
    id: row.id,
    codigo: row.codigo,
    status: row.status,
    descricao: row.descricao,
    data_abertura: row.data_abertura,
    data_encerramento: row.data_encerramento,
    item_achado_id: row.item_achado_id,
    relato_perda_id: row.relato_perda_id,
    responsavel_id: row.responsavel_id,
    item: row.item_codigo ? { id: row.item_achado_id, codigo: row.item_codigo, titulo: row.item_titulo, status: row.item_status } : null,
    relato: row.relato_codigo ? { id: row.relato_perda_id, codigo: row.relato_codigo, titulo: row.relato_titulo } : null,
    responsavel: row.responsavel_nome ? { id: row.responsavel_id, nome: row.responsavel_nome } : null,
  };
}

const SELECT_CASO = `
  SELECT c.id, c.codigo, c.status, c.descricao, c.data_abertura, c.data_encerramento,
         c.item_achado_id, c.relato_perda_id, c.responsavel_id,
         i.codigo AS item_codigo, i.titulo AS item_titulo, i.status AS item_status,
         r.codigo AS relato_codigo, r.titulo AS relato_titulo,
         u.nome   AS responsavel_nome
  FROM casos c
  LEFT JOIN itens_achados i ON i.id = c.item_achado_id
  LEFT JOIN relatos_perda r ON r.id = c.relato_perda_id
  LEFT JOIN usuarios u      ON u.id = c.responsavel_id
`;

// GET /api/casos?status=
export async function listarCasos(req, res) {
  const status = req.query.status || '';
  try {
    const sql = `${SELECT_CASO} WHERE ($1 = '' OR c.status = $1) ORDER BY c.data_abertura DESC`;
    const result = await pool.query(sql, [status]);
    return res.json(result.rows.map(mapCaso));
  } catch (err) {
    console.error('Erro ao listar casos:', err);
    return res.status(500).json({ error: 'Erro interno ao listar casos.' });
  }
}

// GET /api/casos/:id
export async function obterCaso(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(`${SELECT_CASO} WHERE c.id = $1`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Caso não encontrado.' });
    }
    return res.json(mapCaso(result.rows[0]));
  } catch (err) {
    console.error('Erro ao obter caso:', err);
    return res.status(500).json({ error: 'Erro interno ao obter caso.' });
  }
}

// POST /api/casos — abre um caso ligando um item achado a um relato (UC-07).
export async function criarCaso(req, res) {
  const { item_achado_id, relato_perda_id, descricao } = req.body;
  const usuario_id = req.usuario ? req.usuario.id : null;

  if (!item_achado_id) {
    return res.status(422).json({ error: 'Informe o item achado do caso.' });
  }

  const ano = new Date().getFullYear();
  try {
    const item = await pool.query('SELECT id FROM itens_achados WHERE id = $1', [item_achado_id]);
    if (item.rowCount === 0) {
      return res.status(404).json({ error: 'Item não encontrado.' });
    }

    // impede abrir um segundo caso enquanto já houver um em andamento para o item
    const casoAtivo = await pool.query(
      `SELECT codigo FROM casos WHERE item_achado_id = $1 AND status NOT IN ('DEVOLVIDO','ENCERRADO','CANCELADO') LIMIT 1`,
      [item_achado_id]
    );
    if (casoAtivo.rowCount) {
      return res.status(409).json({ error: `Este item já possui um caso em andamento (${casoAtivo.rows[0].codigo}).` });
    }

    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const { rows: cnt } = await pool.query(
        `SELECT COUNT(*)::int AS n FROM casos WHERE codigo LIKE $1`,
        [`CASO-${ano}-%`]
      );
      const seq = cnt[0].n + 1 + tentativa;
      const codigo = `CASO-${ano}-${String(seq).padStart(4, '0')}`;
      try {
        const { rows } = await pool.query(
          `INSERT INTO casos
             (codigo, item_achado_id, relato_perda_id, responsavel_id, status, descricao, criado_por)
           VALUES ($1, $2, $3, $4, 'ABERTO', $5, $4)
           RETURNING id`,
          [codigo, item_achado_id, relato_perda_id || null, usuario_id, descricao || null]
        );
        const { rows: full } = await pool.query(`${SELECT_CASO} WHERE c.id = $1`, [rows[0].id]);
        return res.status(201).json(mapCaso(full[0]));
      } catch (e) {
        if (e.code === '23505' && tentativa < 4) continue; // colisão de código -> tenta o próximo
        if (e.code === '23503') return res.status(422).json({ error: 'Item ou relato inexistente.' });
        throw e;
      }
    }
    return res.status(500).json({ error: 'Não foi possível gerar o código do caso.' });
  } catch (err) {
    console.error('Erro ao criar caso:', err);
    return res.status(500).json({ error: 'Erro interno ao criar caso.' });
  }
}

// PATCH /api/casos/:id/encerrar
export async function encerrarCaso(req, res) {
  const { id } = req.params;
  try {
    // Confere a situação do caso e do item vinculado antes de encerrar.
    const atual = await pool.query(
      `SELECT c.status AS caso_status, c.relato_perda_id, i.status AS item_status
         FROM casos c
         JOIN itens_achados i ON i.id = c.item_achado_id
        WHERE c.id = $1`,
      [id]
    );
    if (atual.rowCount === 0) {
      return res.status(404).json({ error: 'Caso não encontrado.' });
    }
    const { caso_status, relato_perda_id, item_status } = atual.rows[0];
    if (caso_status === 'ENCERRADO' || caso_status === 'CANCELADO') {
      return res.status(409).json({ error: 'Este caso já está encerrado ou cancelado.' });
    }
    // Regra: o item só pode encerrar o caso depois de devolvido ou descartado.
    if (item_status !== 'DEVOLVIDO' && item_status !== 'DESCARTADO') {
      return res.status(422).json({
        error: 'Só é possível encerrar o caso quando o item estiver devolvido ou descartado.',
      });
    }

    // Encerra o caso e, junto, o relato de perda vinculado (reflete na área do aluno).
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `UPDATE casos SET status = 'ENCERRADO', data_encerramento = now() WHERE id = $1 RETURNING *`,
        [id]
      );
      if (relato_perda_id) {
        await client.query(
          `UPDATE relatos_perda SET status = 'ENCERRADO', atualizado_em = now()
            WHERE id = $1 AND status NOT IN ('ENCERRADO', 'CANCELADO')`,
          [relato_perda_id]
        );
      }
      await client.query('COMMIT');
      return res.json({ mensagem: 'Caso encerrado com sucesso.', caso: result.rows[0] });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Erro ao encerrar caso:', err);
    return res.status(500).json({ error: 'Erro interno ao encerrar caso.' });
  }
}

// PATCH /api/casos/:id/cancelar — cancela um caso aberto por engano (NÃO exige item devolvido).
export async function cancelarCaso(req, res) {
  const { id } = req.params;
  const motivo = ((req.body && req.body.motivo) || '').trim();
  try {
    const atual = await pool.query(
      `SELECT c.status AS caso_status, i.id AS item_id, i.status AS item_status
         FROM casos c
         JOIN itens_achados i ON i.id = c.item_achado_id
        WHERE c.id = $1`,
      [id]
    );
    if (atual.rowCount === 0) {
      return res.status(404).json({ error: 'Caso não encontrado.' });
    }
    const { caso_status, item_id, item_status } = atual.rows[0];
    if (caso_status === 'ENCERRADO' || caso_status === 'CANCELADO') {
      return res.status(409).json({ error: 'Este caso já está encerrado ou cancelado.' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `UPDATE casos
            SET status = 'CANCELADO', data_encerramento = now(),
                descricao = CASE WHEN $2 <> '' THEN COALESCE(descricao || E'\n', '') || '[Cancelado] ' || $2 ELSE descricao END
          WHERE id = $1 RETURNING *`,
        [id, motivo]
      );
      // Se o item estava em análise por causa deste caso, devolve para custódia (fica disponível de novo).
      if (item_status === 'EM_ANALISE') {
        await client.query(`UPDATE itens_achados SET status = 'EM_CUSTODIA' WHERE id = $1`, [item_id]);
      }
      await client.query('COMMIT');
      return res.json({ mensagem: 'Caso cancelado.', caso: result.rows[0] });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Erro ao cancelar caso:', err);
    return res.status(500).json({ error: 'Erro interno ao cancelar caso.' });
  }
}
