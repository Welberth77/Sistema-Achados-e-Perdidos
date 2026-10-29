import pool from '../config/db.js';

const STATUS_ITEM = ['RECEBIDO', 'EM_CUSTODIA', 'EM_ANALISE', 'EM_DEVOLUCAO', 'DEVOLVIDO', 'DESCARTADO'];

const SELECT_ITEM = `
  SELECT i.id, i.codigo, i.titulo, i.descricao, i.categoria_id, i.cor, i.marca,
         i.local_encontrado, i.data_encontrado, i.registrador_id, i.status,
         i.foto_url, i.observacoes,
         c.nome  AS categoria_nome,
         r.nome  AS registrador_nome
  FROM itens_achados i
  LEFT JOIN categorias    c ON c.id = i.categoria_id
  LEFT JOIN registradores r ON r.id = i.registrador_id
`;

function mapItem(row) {
  return {
    id: row.id,
    codigo: row.codigo,
    titulo: row.titulo,
    descricao: row.descricao,
    categoria_id: row.categoria_id,
    cor: row.cor,
    marca: row.marca,
    local_encontrado: row.local_encontrado,
    data_encontrado: row.data_encontrado,
    registrador_id: row.registrador_id,
    status: row.status,
    foto_url: row.foto_url,
    observacoes: row.observacoes,
    categoria: row.categoria_nome ? { id: row.categoria_id, nome: row.categoria_nome } : null,
    registrador: row.registrador_nome ? { id: row.registrador_id, nome: row.registrador_nome } : null,
  };
}

// Resolve (ou cria) o registrador que corresponde ao servidor logado.
// Assim "quem registrou" é sempre o servidor do balcão, sem escolher na lista.
async function registradorDoUsuario(usuarioId) {
  const u = await pool.query('SELECT nome, email FROM usuarios WHERE id = $1', [usuarioId]);
  if (!u.rows.length) return null;
  const { nome, email } = u.rows[0];
  if (email) {
    const existe = await pool.query('SELECT id FROM registradores WHERE email = $1 ORDER BY id LIMIT 1', [email]);
    if (existe.rows.length) return existe.rows[0].id;
  }
  const ins = await pool.query(
    `INSERT INTO registradores (nome, vinculo, email) VALUES ($1, 'SERVIDOR', $2) RETURNING id`,
    [nome, email]
  );
  return ins.rows[0].id;
}

// GET /api/itens?q=&categoria=&categoria_id=&status=&data_inicio=&data_fim=
export async function listarItens(req, res) {
  const q = req.query.q || '';
  const categoria = req.query.categoria || '';
  const categoria_id = String(req.query.categoria_id || '');
  const status = req.query.status || '';
  const data_inicio = req.query.data_inicio || '';
  const data_fim = req.query.data_fim || '';
  try {
    const sql = `${SELECT_ITEM}
      WHERE ($1 = '' OR i.titulo ILIKE '%' || $1 || '%' OR i.descricao ILIKE '%' || $1 || '%' OR i.codigo ILIKE '%' || $1 || '%')
        AND ($2 = '' OR c.nome = $2)
        AND ($3 = '' OR i.categoria_id = NULLIF($3, '')::bigint)
        AND ($4 = '' OR i.status = $4)
        AND ($5 = '' OR i.data_encontrado >= NULLIF($5, '')::date)
        AND ($6 = '' OR i.data_encontrado <= NULLIF($6, '')::date)
      ORDER BY i.data_encontrado DESC, i.id DESC`;
    const { rows } = await pool.query(sql, [q, categoria, categoria_id, status, data_inicio, data_fim]);
    return res.json(rows.map(mapItem));
  } catch (err) {
    console.error('Erro ao listar itens:', err);
    return res.status(500).json({ error: 'Erro ao listar itens.' });
  }
}

// GET /api/itens/:id  — item + histórico de custódia (staff).
export async function obterItem(req, res) {
  try {
    const { rows } = await pool.query(`${SELECT_ITEM} WHERE i.id = $1`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Item não encontrado.' });
    const item = mapItem(rows[0]);
    const { rows: cust } = await pool.query(
      `SELECT cu.id, cu.tipo, cu.local_guarda, cu.data_evento, u.nome AS usuario_nome
       FROM custodias cu
       LEFT JOIN usuarios u ON u.id = cu.usuario_id
       WHERE cu.item_achado_id = $1
       ORDER BY cu.data_evento DESC, cu.id DESC`,
      [req.params.id]
    );
    item.custodias = cust.map((c) => ({
      id: c.id,
      tipo: c.tipo,
      local_guarda: c.local_guarda,
      usuario: c.usuario_nome,
      data_evento: c.data_evento,
    }));
    return res.json(item);
  } catch (err) {
    console.error('Erro ao obter item:', err);
    return res.status(500).json({ error: 'Erro ao carregar o item.' });
  }
}

// POST /api/itens  — cadastra um item achado (staff). Registrador = servidor logado.
export async function criarItem(req, res) {
  const {
    titulo, descricao, categoria_id, cor, marca,
    local_encontrado, data_encontrado, status, foto_url, observacoes,
  } = req.body;

  if (!titulo || !String(titulo).trim()) return res.status(400).json({ error: 'Informe o título do item.' });
  if (!data_encontrado) return res.status(400).json({ error: 'Informe a data em que foi encontrado.' });

  // No cadastro, o item só pode entrar como RECEBIDO ou EM_CUSTODIA.
  const STATUS_CADASTRO = ['RECEBIDO', 'EM_CUSTODIA'];
  if (status && !STATUS_CADASTRO.includes(status)) {
    return res.status(422).json({ error: 'Item só pode ser cadastrado como Recebido ou Em custódia.' });
  }
  const statusFinal = status || 'RECEBIDO';
  const ano = new Date().getFullYear();
  try {
    const registrador_id = await registradorDoUsuario(req.usuario.id);

    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const { rows: cnt } = await pool.query(
        `SELECT COUNT(*)::int AS n FROM itens_achados WHERE codigo LIKE $1`,
        [`ACH-${ano}-%`]
      );
      const seq = cnt[0].n + 1 + tentativa;
      const codigo = `ACH-${ano}-${String(seq).padStart(4, '0')}`;
      try {
        const { rows } = await pool.query(
          `INSERT INTO itens_achados
             (codigo, titulo, descricao, categoria_id, cor, marca, local_encontrado,
              data_encontrado, registrador_id, status, foto_url, observacoes, criado_por)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
           RETURNING id`,
          [
            codigo, String(titulo).trim(), descricao || null, categoria_id || null, cor || null,
            marca || null, local_encontrado || null, data_encontrado, registrador_id, statusFinal,
            foto_url || null, observacoes || null, req.usuario.id,
          ]
        );
        const { rows: full } = await pool.query(`${SELECT_ITEM} WHERE i.id = $1`, [rows[0].id]);
        return res.status(201).json(mapItem(full[0]));
      } catch (e) {
        if (e.code === '23505' && tentativa < 4) continue;
        throw e;
      }
    }
    return res.status(500).json({ error: 'Não foi possível gerar o código do item.' });
  } catch (err) {
    console.error('Erro ao criar item:', err);
    return res.status(500).json({ error: 'Erro ao cadastrar o item.' });
  }
}

// PUT /api/itens/:id  (staff) — mantém o registrador atual se não vier outro.
export async function atualizarItem(req, res) {
  const { id } = req.params;
  const {
    titulo, descricao, categoria_id, cor, marca,
    local_encontrado, data_encontrado, registrador_id, status, foto_url, observacoes,
  } = req.body;
  if (!titulo || !String(titulo).trim()) return res.status(400).json({ error: 'Informe o título do item.' });
  if (!data_encontrado) return res.status(400).json({ error: 'Informe a data em que foi encontrado.' });
  try {
    const { rowCount } = await pool.query(
      `UPDATE itens_achados SET
         titulo=$1, descricao=$2, categoria_id=$3, cor=$4, marca=$5,
         local_encontrado=$6, data_encontrado=$7, registrador_id=COALESCE($8, registrador_id),
         foto_url=$9, observacoes=$10, status=COALESCE($11, status), atualizado_em=now()
       WHERE id=$12`,
      [String(titulo).trim(), descricao || null, categoria_id || null, cor || null, marca || null,
       local_encontrado || null, data_encontrado, registrador_id || null, foto_url || null,
       observacoes || null, status || null, id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Item não encontrado.' });
    const { rows } = await pool.query(`${SELECT_ITEM} WHERE i.id = $1`, [id]);
    return res.json(mapItem(rows[0]));
  } catch (err) {
    console.error('Erro ao atualizar item:', err);
    return res.status(500).json({ error: 'Erro ao atualizar o item.' });
  }
}

// DELETE /api/itens/:id  (staff)
export async function excluirItem(req, res) {
  try {
    const { rowCount } = await pool.query('DELETE FROM itens_achados WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Item não encontrado.' });
    return res.status(204).end();
  } catch (err) {
    if (err.code === '23503') return res.status(409).json({ error: 'Não é possível excluir: há caso ou devolução vinculado a este item.' });
    console.error('Erro ao excluir item:', err);
    return res.status(500).json({ error: 'Erro ao excluir o item.' });
  }
}
