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
    item: row.item_codigo ? { id: row.item_achado_id, codigo: row.item_codigo, titulo: row.item_titulo } : null,
    relato: row.relato_codigo ? { id: row.relato_perda_id, codigo: row.relato_codigo, titulo: row.relato_titulo } : null,
    responsavel: row.responsavel_nome ? { id: row.responsavel_id, nome: row.responsavel_nome } : null,
  };
}

const SELECT_CASO = `
  SELECT c.id, c.codigo, c.status, c.descricao, c.data_abertura, c.data_encerramento,
         c.item_achado_id, c.relato_perda_id, c.responsavel_id,
         i.codigo AS item_codigo, i.titulo AS item_titulo,
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
    const result = await pool.query(
      `UPDATE casos SET status = 'ENCERRADO', data_encerramento = now() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Caso não encontrado.' });
    }
    return res.json({ mensagem: 'Caso encerrado com sucesso.', caso: result.rows[0] });
  } catch (err) {
    console.error('Erro ao encerrar caso:', err);
    return res.status(500).json({ error: 'Erro interno ao encerrar caso.' });
  }
}
