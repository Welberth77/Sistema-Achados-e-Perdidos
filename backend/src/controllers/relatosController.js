import pool from '../config/db.js';

const SELECT_RELATO = `
  SELECT r.id, r.codigo, r.titulo, r.descricao, r.categoria_id, r.cor, r.marca,
         r.local_perda, r.data_perda, r.registrador_id, r.status, r.criado_em,
         c.nome  AS categoria_nome,
         rg.nome AS registrador_nome
  FROM relatos_perda r
  LEFT JOIN categorias    c  ON c.id  = r.categoria_id
  LEFT JOIN registradores rg ON rg.id = r.registrador_id
`;

function mapRelato(row) {
  return {
    id: row.id,
    codigo: row.codigo,
    titulo: row.titulo,
    descricao: row.descricao,
    categoria_id: row.categoria_id,
    cor: row.cor,
    marca: row.marca,
    local_perda: row.local_perda,
    data_perda: row.data_perda,
    registrador_id: row.registrador_id,
    status: row.status,
    criado_em: row.criado_em,
    categoria: row.categoria_nome ? { id: row.categoria_id, nome: row.categoria_nome } : null,
    registrador: row.registrador_nome ? { id: row.registrador_id, nome: row.registrador_nome } : null,
  };
}

// GET /api/relatos?q=&status=&categoria_id=  — todos os relatos (staff).
export async function listarRelatos(req, res) {
  const q = req.query.q || '';
  const status = req.query.status || '';
  const categoria_id = String(req.query.categoria_id || '');
  try {
    const sql = `${SELECT_RELATO}
      WHERE ($1 = '' OR r.titulo ILIKE '%' || $1 || '%' OR r.descricao ILIKE '%' || $1 || '%' OR r.codigo ILIKE '%' || $1 || '%')
        AND ($2 = '' OR r.status = $2)
        AND ($3 = '' OR r.categoria_id = NULLIF($3, '')::bigint)
      ORDER BY r.criado_em DESC`;
    const { rows } = await pool.query(sql, [q, status, categoria_id]);
    return res.json(rows.map(mapRelato));
  } catch (err) {
    console.error('Erro ao listar relatos:', err);
    return res.status(500).json({ error: 'Erro ao listar relatos.' });
  }
}

// GET /api/relatos/meus — relatos criados pelo próprio usuário logado.
export async function meusRelatos(req, res) {
  try {
    const { rows } = await pool.query(
      `${SELECT_RELATO} WHERE r.criado_por = $1 ORDER BY r.criado_em DESC`,
      [req.usuario.id]
    );
    return res.json(rows.map(mapRelato));
  } catch (err) {
    console.error('Erro ao listar meus relatos:', err);
    return res.status(500).json({ error: 'Erro ao carregar seus relatos.' });
  }
}

// GET /api/relatos/:id — detalhe do relato (staff).
export async function obterRelato(req, res) {
  try {
    const { rows } = await pool.query(`${SELECT_RELATO} WHERE r.id = $1`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Relato não encontrado.' });
    return res.json(mapRelato(rows[0]));
  } catch (err) {
    console.error('Erro ao obter relato:', err);
    return res.status(500).json({ error: 'Erro ao carregar o relato.' });
  }
}

// GET /api/relatos/:id/correspondencias — itens achados sugeridos para o relato (staff).
export async function listarCorrespondencias(req, res) {
  const { id } = req.params;
  try {
    const rel = await pool.query('SELECT categoria_id, titulo FROM relatos_perda WHERE id = $1', [id]);
    if (!rel.rows.length) return res.status(404).json({ error: 'Relato não encontrado.' });
    const { categoria_id, titulo } = rel.rows[0];

    // 1) Correspondências já registradas na tabela.
    const stored = await pool.query(
      `SELECT co.id, co.item_achado_id, co.pontuacao, co.status,
              i.codigo AS item_codigo, i.titulo AS item_titulo
       FROM correspondencias co
       JOIN itens_achados i ON i.id = co.item_achado_id
       WHERE co.relato_perda_id = $1
       ORDER BY co.pontuacao DESC NULLS LAST, co.id DESC`,
      [id]
    );
    if (stored.rows.length) {
      return res.json(stored.rows.map((c) => ({
        id: c.id,
        item_achado_id: c.item_achado_id,
        item: { id: c.item_achado_id, codigo: c.item_codigo, titulo: c.item_titulo },
        pontuacao: c.pontuacao != null ? Number(c.pontuacao) : null,
        status: c.status,
      })));
    }

    // 2) Sugestões automáticas: itens ativos na mesma categoria ou com título parecido.
    const sug = await pool.query(
      `SELECT i.id, i.codigo, i.titulo,
              ((CASE WHEN $1::bigint IS NOT NULL AND i.categoria_id = $1::bigint THEN 60 ELSE 0 END)
             + (CASE WHEN $2 <> '' AND i.titulo ILIKE '%' || $2 || '%' THEN 40 ELSE 0 END)) AS score
       FROM itens_achados i
       WHERE i.status NOT IN ('DEVOLVIDO','DESCARTADO')
         AND (($1::bigint IS NOT NULL AND i.categoria_id = $1::bigint)
           OR ($2 <> '' AND i.titulo ILIKE '%' || $2 || '%'))
       ORDER BY score DESC, i.data_encontrado DESC
       LIMIT 10`,
      [categoria_id, titulo || '']
    );
    return res.json(sug.rows.map((i) => ({
      id: `sug-${i.id}`,
      item_achado_id: i.id,
      item: { id: i.id, codigo: i.codigo, titulo: i.titulo },
      pontuacao: Number(i.score),
      status: 'SUGERIDA',
    })));
  } catch (err) {
    console.error('Erro ao listar correspondências:', err);
    return res.status(500).json({ error: 'Erro ao carregar correspondências.' });
  }
}

// POST /api/relatos — registra um relato de perda do usuário logado.
export async function criarRelato(req, res) {
  const { titulo, descricao, categoria_id, local_perda, data_perda } = req.body;
  if (!titulo || !String(titulo).trim()) return res.status(400).json({ error: 'Informe o título do item perdido.' });

  const codigo =
    'REL-' +
    new Date().toISOString().slice(2, 10).replace(/-/g, '') +
    '-' +
    String(Math.floor(Math.random() * 10000)).padStart(4, '0');

  try {
    const { rows } = await pool.query(
      `INSERT INTO relatos_perda
         (codigo, titulo, descricao, categoria_id, local_perda, data_perda, status, criado_por)
       VALUES ($1, $2, $3, $4, $5, $6, 'ABERTO', $7)
       RETURNING id, codigo, titulo, status`,
      [codigo, String(titulo).trim(), descricao || null, categoria_id || null, local_perda || null, data_perda || null, req.usuario.id]
    );
    return res.status(201).json({ mensagem: 'Relato registrado com sucesso', relato: rows[0] });
  } catch (err) {
    console.error('Erro ao criar relato:', err);
    return res.status(500).json({ error: 'Erro ao registrar o relato.' });
  }
}

// PUT /api/relatos/:id  (staff)
export async function atualizarRelato(req, res) {
  const { id } = req.params;
  const { titulo, descricao, categoria_id, cor, marca, local_perda, data_perda, registrador_id, status } = req.body;
  if (!titulo || !String(titulo).trim()) return res.status(400).json({ error: 'Informe o título do relato.' });
  try {
    const { rowCount } = await pool.query(
      `UPDATE relatos_perda SET
         titulo=$1, descricao=$2, categoria_id=$3, cor=$4, marca=$5,
         local_perda=$6, data_perda=$7, registrador_id=$8,
         status=COALESCE($9, status), atualizado_em=now()
       WHERE id=$10`,
      [String(titulo).trim(), descricao || null, categoria_id || null, cor || null, marca || null,
       local_perda || null, data_perda || null, registrador_id || null, status || null, id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Relato não encontrado.' });
    const { rows } = await pool.query(`${SELECT_RELATO} WHERE r.id = $1`, [id]);
    return res.json(mapRelato(rows[0]));
  } catch (err) {
    console.error('Erro ao atualizar relato:', err);
    return res.status(500).json({ error: 'Erro ao atualizar o relato.' });
  }
}

// DELETE /api/relatos/:id  (staff)
export async function excluirRelato(req, res) {
  try {
    const { rowCount } = await pool.query('DELETE FROM relatos_perda WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Relato não encontrado.' });
    return res.status(204).end();
  } catch (err) {
    if (err.code === '23503') return res.status(409).json({ error: 'Não é possível excluir: há vínculo com este relato.' });
    console.error('Erro ao excluir relato:', err);
    return res.status(500).json({ error: 'Erro ao excluir o relato.' });
  }
}

// GET /api/relatos/meus/correspondencias — itens achados parecidos com os relatos do próprio aluno.
export async function minhasCorrespondencias(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT r.id AS relato_id, r.codigo AS relato_codigo, r.titulo AS relato_titulo,
              i.id AS item_id, i.codigo AS item_codigo, i.titulo AS item_titulo,
              i.local_encontrado, i.data_encontrado, i.status,
              c.nome AS categoria_nome,
              ((CASE WHEN r.categoria_id IS NOT NULL AND i.categoria_id = r.categoria_id THEN 60 ELSE 0 END)
             + (CASE WHEN r.titulo <> '' AND i.titulo ILIKE '%' || r.titulo || '%' THEN 40 ELSE 0 END)) AS score
       FROM relatos_perda r
       JOIN itens_achados i
         ON i.status NOT IN ('DEVOLVIDO','DESCARTADO')
        AND ((r.categoria_id IS NOT NULL AND i.categoria_id = r.categoria_id)
          OR (r.titulo <> '' AND i.titulo ILIKE '%' || r.titulo || '%'))
       LEFT JOIN categorias c ON c.id = i.categoria_id
       WHERE r.criado_por = $1
         AND r.status NOT IN ('ENCERRADO','CANCELADO')
       ORDER BY r.criado_em DESC, score DESC, i.data_encontrado DESC`,
      [req.usuario.id]
    );

    const mapa = new Map();
    for (const row of rows) {
      if (!mapa.has(row.relato_id)) {
        mapa.set(row.relato_id, {
          relato: { id: row.relato_id, codigo: row.relato_codigo, titulo: row.relato_titulo },
          itens: [],
        });
      }
      const g = mapa.get(row.relato_id);
      if (g.itens.length < 5) {
        g.itens.push({
          id: row.item_id,
          codigo: row.item_codigo,
          titulo: row.item_titulo,
          local_encontrado: row.local_encontrado,
          data_encontrado: row.data_encontrado,
          status: row.status,
          pontuacao: Number(row.score),
          categoria: row.categoria_nome ? { nome: row.categoria_nome } : null,
        });
      }
    }
    return res.json(Array.from(mapa.values()));
  } catch (err) {
    console.error('Erro ao buscar correspondências do aluno:', err);
    return res.status(500).json({ error: 'Erro ao carregar correspondências.' });
  }
}
