import { Router } from 'express';
import pool from '../db.js';

const router = Router();

function responderErro(res, status, code, message, details = []) {
  return res.status(status).json({ error: { code, message, details } });
}

function idValido(valor) {
  return (
    ['string', 'number'].includes(typeof valor) &&
    /^[1-9]\d*$/.test(String(valor)) &&
    Number.isSafeInteger(Number(valor))
  );
}

function dataValida(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  const data = new Date(`${valor}T00:00:00.000Z`);

  return (
    !Number.isNaN(data.getTime()) &&
    data.getUTCFullYear() >= 1 &&
    data.toISOString().slice(0, 10) === valor
  );
}

const consultaRelato = `
  SELECT r.*, to_char(r.data_perda, 'YYYY-MM-DD') AS data_perda
  FROM relatos_perda r
`;

router.get('/', async (req, res, next) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const q = req.query.q ?? '';
  const status = req.query.status ?? '';
  const categoriaId = req.query.categoria_id;

  const statusPermitidos = ['ABERTO', 'EM_ANALISE', 'CORRESPONDENCIA', 'ENCERRADO', 'CANCELADO'];

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isSafeInteger((page - 1) * limit) ||
    typeof q !== 'string' ||
    typeof status !== 'string' ||
    (status !== '' && !statusPermitidos.includes(status)) ||
    (categoriaId !== undefined && !idValido(categoriaId))
  ) {
    return responderErro(
      res,
      422,
      'VALIDATION_ERROR',
      'Confira os filtros. page deve ser positivo e limit entre 1 e 100.'
    );
  }

  const filtro = `
    WHERE (
      $1::text = '' OR
      r.titulo ILIKE '%' || $1 || '%' OR
      r.descricao ILIKE '%' || $1 || '%'
    )
    AND ($2::bigint IS NULL OR r.categoria_id = $2)
    AND ($3::text = '' OR r.status = $3)
  `;

  const parametros = [q.trim(), categoriaId ?? null, status];

  try {
    const contagem = await pool.query(
      `SELECT COUNT(*) AS total FROM relatos_perda r ${filtro}`,
      parametros
    );

    const resultado = await pool.query(
      `${consultaRelato}
       ${filtro}
       ORDER BY r.criado_em DESC, r.id DESC
       LIMIT $4 OFFSET $5`,
      [...parametros, limit, (page - 1) * limit]
    );

    const total = Number(contagem.rows[0].total);

    return res.json({
      data: resultado.rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (erro) {
    return next(erro);
  }
});
router.get('/:id', async (req, res, next) => {
  if (!idValido(req.params.id)) {
    return responderErro(res, 422, 'VALIDATION_ERROR', 'ID inválido.');
  }

  try {
    const resultado = await pool.query(`${consultaRelato} WHERE r.id = $1`, [req.params.id]);

    if (!resultado.rows.length) {
      return responderErro(res, 404, 'NOT_FOUND', 'Relato não encontrado.');
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    return next(erro);
  }
});

router.post('/', async (req, res, next) => {
  const corpo = req.body;

  if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) {
    return responderErro(res, 422, 'VALIDATION_ERROR', 'Envie um objeto JSON.');
  }

  const protegidos = ['id', 'codigo', 'status', 'criado_por', 'criado_em', 'atualizado_em'];

  if (protegidos.some((campo) => Object.hasOwn(corpo, campo))) {
    return responderErro(
      res,
      422,
      'VALIDATION_ERROR',
      'Não envie status ou campos gerados pelo sistema.'
    );
  }

  const limites = {
    titulo: 160,
    descricao: 10000,
    cor: 40,
    marca: 60,
    local_perda: 160,
    observacoes: 10000,
  };

  const dados = {};
  const erros = [];

  for (const [campo, limite] of Object.entries(limites)) {
    const valor = corpo[campo];

    if (valor === undefined || valor === null) {
      dados[campo] = null;
    } else if (typeof valor !== 'string') {
      erros.push({ campo, message: 'Deve ser um texto.' });
    } else {
      dados[campo] = valor.trim() || null;

      if (dados[campo] && dados[campo].length > limite) {
        erros.push({ campo, message: `Máximo de ${limite} caracteres.` });
      }
    }
  }

  if (!dados.titulo) {
    erros.push({ campo: 'titulo', message: 'Título obrigatório.' });
  }

  if (!idValido(corpo.registrador_id)) {
    erros.push({
      campo: 'registrador_id',
      message: 'Informe um ID de registrador válido.',
    });
  }

  const categoriaId = corpo.categoria_id ?? null;
  const dataPerda = corpo.data_perda ?? null;

  if (categoriaId !== null && !idValido(categoriaId)) {
    erros.push({
      campo: 'categoria_id',
      message: 'Informe um ID de categoria válido.',
    });
  }

  if (dataPerda !== null && !dataValida(dataPerda)) {
    erros.push({
      campo: 'data_perda',
      message: 'Informe uma data válida no formato YYYY-MM-DD.',
    });
  }

  if (erros.length) {
    return responderErro(res, 422, 'VALIDATION_ERROR', 'Confira os dados do relato.', erros);
  }

  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    await client.query('LOCK TABLE relatos_perda IN SHARE ROW EXCLUSIVE MODE');

    const ano = new Date().getUTCFullYear();
    const prefixo = `REL-${ano}-`;

    const sequencia = await client.query(
      `SELECT COALESCE(
         MAX(substring(codigo from '[0-9]+$')::bigint), 0
       ) + 1 AS proximo
       FROM relatos_perda
       WHERE codigo LIKE $1`,
      [`${prefixo}%`]
    );

    const codigo = prefixo + String(sequencia.rows[0].proximo).padStart(4, '0');

    const cadastro = await client.query(
      `INSERT INTO relatos_perda (
         codigo, titulo, descricao, categoria_id, cor, marca,
         local_perda, data_perda, registrador_id, observacoes, criado_por
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        codigo,
        dados.titulo,
        dados.descricao,
        categoriaId,
        dados.cor,
        dados.marca,
        dados.local_perda,
        dataPerda,
        corpo.registrador_id,
        dados.observacoes,
        req.user.id,
      ]
    );

    const resultado = await client.query(`${consultaRelato} WHERE r.id = $1`, [
      cadastro.rows[0].id,
    ]);

    await client.query('COMMIT');
    return res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (erroRollback) {
        console.error('Falha ao desfazer cadastro:', erroRollback);
      }
    }

    if (erro.code === '23503') {
      return responderErro(
        res,
        422,
        'VALIDATION_ERROR',
        'O registrador ou a categoria informada não existe.'
      );
    }

    return next(erro);
  } finally {
    if (client) client.release();
  }
});

router.put('/:id', async (req, res, next) => {
  if (!idValido(req.params.id)) {
    return responderErro(res, 422, 'VALIDATION_ERROR', 'ID inválido.');
  }

  const corpo = req.body;

  if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) {
    return responderErro(res, 422, 'VALIDATION_ERROR', 'Envie um objeto JSON.');
  }

  const protegidos = ['id', 'codigo', 'status', 'criado_por', 'criado_em', 'atualizado_em'];

  if (protegidos.some((campo) => Object.hasOwn(corpo, campo))) {
    return responderErro(
      res,
      422,
      'VALIDATION_ERROR',
      'Não envie status ou campos gerados pelo sistema.'
    );
  }

  const limites = {
    titulo: 160,
    descricao: 10000,
    cor: 40,
    marca: 60,
    local_perda: 160,
    observacoes: 10000,
  };

  const dados = {};
  const erros = [];

  for (const [campo, limite] of Object.entries(limites)) {
    const valor = corpo[campo];

    if (valor === undefined || valor === null) {
      dados[campo] = null;
    } else if (typeof valor !== 'string') {
      erros.push({ campo, message: 'Deve ser um texto.' });
    } else {
      dados[campo] = valor.trim() || null;

      if (dados[campo] && dados[campo].length > limite) {
        erros.push({ campo, message: `Máximo de ${limite} caracteres.` });
      }
    }
  }

  if (!dados.titulo) {
    erros.push({ campo: 'titulo', message: 'Título obrigatório.' });
  }

  if (!idValido(corpo.registrador_id)) {
    erros.push({
      campo: 'registrador_id',
      message: 'Informe um ID de registrador válido.',
    });
  }

  const categoriaId = corpo.categoria_id ?? null;
  const dataPerda = corpo.data_perda ?? null;

  if (categoriaId !== null && !idValido(categoriaId)) {
    erros.push({
      campo: 'categoria_id',
      message: 'Informe um ID de categoria válido.',
    });
  }

  if (dataPerda !== null && !dataValida(dataPerda)) {
    erros.push({
      campo: 'data_perda',
      message: 'Informe uma data válida no formato YYYY-MM-DD.',
    });
  }

  if (erros.length) {
    return responderErro(res, 422, 'VALIDATION_ERROR', 'Confira os dados do relato.', erros);
  }

  try {
    const resultado = await pool.query(
      `UPDATE relatos_perda
       SET titulo = $1,
           descricao = $2,
           categoria_id = $3,
           cor = $4,
           marca = $5,
           local_perda = $6,
           data_perda = $7,
           registrador_id = $8,
           observacoes = $9
       WHERE id = $10
       RETURNING *,
         to_char(data_perda, 'YYYY-MM-DD') AS data_perda`,
      [
        dados.titulo,
        dados.descricao,
        categoriaId,
        dados.cor,
        dados.marca,
        dados.local_perda,
        dataPerda,
        corpo.registrador_id,
        dados.observacoes,
        req.params.id,
      ]
    );

    if (!resultado.rows.length) {
      return responderErro(res, 404, 'NOT_FOUND', 'Relato não encontrado.');
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    if (erro.code === '23503') {
      return responderErro(
        res,
        422,
        'VALIDATION_ERROR',
        'O registrador ou a categoria informada não existe.'
      );
    }

    return next(erro);
  }
});

router.get('/:id/correspondencias', async (req, res, next) => {
  if (!idValido(req.params.id)) {
    return responderErro(res, 422, 'VALIDATION_ERROR', 'ID inválido.');
  }

  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isSafeInteger((page - 1) * limit)
  ) {
    return responderErro(
      res,
      422,
      'VALIDATION_ERROR',
      'page deve ser positivo e limit entre 1 e 100.'
    );
  }

  try {
    const relato = await pool.query('SELECT id FROM relatos_perda WHERE id = $1', [req.params.id]);

    if (!relato.rows.length) {
      return responderErro(res, 404, 'NOT_FOUND', 'Relato não encontrado.');
    }

    const contagem = await pool.query(
      `SELECT COUNT(*) AS total
       FROM correspondencias
       WHERE relato_perda_id = $1 AND status = 'SUGERIDA'`,
      [req.params.id]
    );

    const resultado = await pool.query(
      `SELECT id, item_achado_id, relato_perda_id, pontuacao,
              status, criado_em
       FROM correspondencias
       WHERE relato_perda_id = $1 AND status = 'SUGERIDA'
       ORDER BY criado_em DESC, id DESC
       LIMIT $2 OFFSET $3`,
      [req.params.id, limit, (page - 1) * limit]
    );

    const total = Number(contagem.rows[0].total);

    return res.json({
      data: resultado.rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (erro) {
    return next(erro);
  }
});

export default router;
