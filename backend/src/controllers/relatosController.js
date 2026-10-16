import pool from '../config/db.js';

function mapRelato(row) {
  return {
    id: row.id,
    codigo: row.codigo,
    titulo: row.titulo,
    descricao: row.descricao,
    local_perda: row.local_perda,
    data_perda: row.data_perda,
    status: row.status,
    criado_em: row.criado_em,
    categoria: row.categoria_nome ? { nome: row.categoria_nome } : null,
  };
}

// GET /api/relatos/meus — relatos criados pelo próprio usuário logado.
export async function meusRelatos(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.codigo, r.titulo, r.descricao, r.local_perda, r.data_perda,
              r.status, r.criado_em, c.nome AS categoria_nome
       FROM relatos_perda r
       LEFT JOIN categorias c ON c.id = r.categoria_id
       WHERE r.criado_por = $1
       ORDER BY r.criado_em DESC`,
      [req.usuario.id]
    );
    return res.json(rows.map(mapRelato));
  } catch (err) {
    console.error('Erro ao listar meus relatos:', err);
    return res.status(500).json({ error: 'Erro ao carregar seus relatos.' });
  }
}

// POST /api/relatos — registra um relato de perda do usuário logado.
export async function criarRelato(req, res) {
  const { titulo, descricao, categoria_id, local_perda, data_perda } = req.body;

  if (!titulo || !String(titulo).trim()) {
    return res.status(400).json({ error: 'Informe o título do item perdido.' });
  }

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
      [
        codigo,
        String(titulo).trim(),
        descricao || null,
        categoria_id || null,
        local_perda || null,
        data_perda || null,
        req.usuario.id,
      ]
    );
    return res.status(201).json({ mensagem: 'Relato registrado com sucesso', relato: rows[0] });
  } catch (err) {
    console.error('Erro ao criar relato:', err);
    return res.status(500).json({ error: 'Erro ao registrar o relato.' });
  }
}
