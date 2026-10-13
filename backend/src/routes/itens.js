import { Router } from 'express';
import pool from '../db.js';

const router = Router();

function responderErro(res, status, code, message, details = []) {
  return res.status(status).json({
    error: { code, message, details },
  });
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

  const data = new Date(valor + 'T00:00:00Z');

  return (
    Number(valor.slice(0, 4)) >= 1 &&
    !Number.isNaN(data.getTime()) &&
    data.toISOString().slice(0, 10) === valor
  );
}

const consultaItem = `
  SELECT i.*,
         to_char(i.data_encontrado, 'YYYY-MM-DD') AS data_encontrado,
         CASE WHEN c.id IS NULL THEN NULL
              ELSE to_jsonb(c) END AS categoria,
         CASE WHEN r.id IS NULL THEN NULL
              ELSE to_jsonb(r) END AS registrador
  FROM itens_achados i
  LEFT JOIN categorias c ON c.id = i.categoria_id
  LEFT JOIN registradores r ON r.id = i.registrador_id
`;

router.get('/', async (req, res, next) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const q = req.query.q ?? '';
  const status = req.query.status ?? '';
  const categoriaId = req.query.categoria_id;
  const dataInicio = req.query.data_inicio;
  const dataFim = req.query.data_fim;

  const statusPermitidos = [
    'RECEBIDO',
    'EM_CUSTODIA',
    'EM_ANALISE',
    'EM_DEVOLUCAO',
    'DEVOLVIDO',
    'DESCARTADO',
  ];

  const filtrosInvalidos =
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isSafeInteger((page - 1) * limit) ||
    typeof q !== 'string' ||
    typeof status !== 'string' ||
    (status !== '' && !statusPermitidos.includes(status)) ||
    (categoriaId !== undefined && !idValido(categoriaId)) ||
    (dataInicio !== undefined && !dataValida(dataInicio)) ||
    (dataFim !== undefined && !dataValida(dataFim));

  if (filtrosInvalidos) {
    return responderErro(
      res,
      422,
      'VALIDATION_ERROR',
      'Confira os filtros. page deve ser positivo e limit entre 1 e 100.'
    );
  }

  if (dataInicio && dataFim && dataInicio > dataFim) {
    return responderErro(
      res,
      422,
      'VALIDATION_ERROR',
      'data_inicio deve ser anterior ou igual a data_fim.'
    );
  }

  const filtro = `
    WHERE (
      $1::text = '' OR
      i.titulo ILIKE '%' || $1 || '%' OR
      i.descricao ILIKE '%' || $1 || '%'
    )
    AND ($2::bigint IS NULL OR i.categoria_id = $2)
    AND ($3::text = '' OR i.status = $3)
    AND ($4::date IS NULL OR i.data_encontrado >= $4)
    AND ($5::date IS NULL OR i.data_encontrado <= $5)
  `;

  const parametros = [q.trim(), categoriaId ?? null, status, dataInicio ?? null, dataFim ?? null];

  try {
    const contagem = await pool.query(
      `SELECT COUNT(*) AS total FROM itens_achados i ${filtro}`,
      parametros
    );

    const resultado = await pool.query(
      `${consultaItem}
       ${filtro}
       ORDER BY i.criado_em DESC, i.id DESC
       LIMIT $6 OFFSET $7`,
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
    return responderErro(res, 422, 'VALIDATION_ERROR', 'Informe um ID válido.');
  }

  try {
    const resultado = await pool.query(`${consultaItem} WHERE i.id = $1`, [req.params.id]);

    if (!resultado.rows.length) {
      return responderErro(res, 404, 'NOT_FOUND', 'Item não encontrado.');
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    return next(erro);
  }
});

router.post('/', async (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return responderErro(res, 422, 'VALIDATION_ERROR', 'Envie um objeto JSON.');
  }

  const limites = {
    titulo: 160,
    descricao: 10000,
    cor: 40,
    marca: 60,
    local_encontrado: 160,
    foto_url: 255,
    observacoes: 10000,
  };

  const dados = {};
  const erros = [];

  for (const [campo, limite] of Object.entries(limites)) {
    const valor = body[campo];

    if (valor === undefined || valor === null) {
      dados[campo] = null;
    } else if (typeof valor !== 'string') {
      erros.push({ campo, message: 'Deve ser um texto.' });
    } else {
      dados[campo] = valor.trim() || null;

      if (dados[campo] && dados[campo].length > limite) {
        erros.push({
          campo,
          message: `Use no máximo ${limite} caracteres.`,
        });
      }
    }
  }

  if (!dados.titulo) {
    erros.push({ campo: 'titulo', message: 'Informe o título.' });
  }

  if (!dataValida(body.data_encontrado)) {
    erros.push({
      campo: 'data_encontrado',
      message: 'Informe uma data válida no formato YYYY-MM-DD.',
    });
  }

  if (!idValido(body.registrador_id)) {
    erros.push({
      campo: 'registrador_id',
      message: 'Informe um registrador válido.',
    });
  }

  const categoriaId = body.categoria_id ?? null;

  if (categoriaId !== null && !idValido(categoriaId)) {
    erros.push({
      campo: 'categoria_id',
      message: 'Informe uma categoria válida ou null.',
    });
  }

  if (dados.foto_url) {
    try {
      const url = new URL(dados.foto_url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Protocolo inválido');
      }
    } catch {
      erros.push({
        campo: 'foto_url',
        message: 'Informe uma URL HTTP ou HTTPS válida.',
      });
    }
  }

  for (const campo of ['id', 'codigo', 'status', 'criado_por', 'criado_em', 'atualizado_em']) {
    if (Object.prototype.hasOwnProperty.call(body, campo)) {
      erros.push({
        campo,
        message: 'Este campo é preenchido pelo servidor.',
      });
    }
  }

  if (erros.length) {
    return responderErro(res, 422, 'VALIDATION_ERROR', 'Confira os campos do item.', erros);
  }

  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // Serializa a geração do código e o cadastro.
    await client.query('LOCK TABLE itens_achados IN SHARE ROW EXCLUSIVE MODE');

    const ano = new Date().getUTCFullYear();
    const prefixo = `ACH-${ano}-`;

    const sequencia = await client.query(
      `SELECT COALESCE(
         MAX(substring(codigo from '[0-9]+$')::bigint), 0
       ) + 1 AS proximo
       FROM itens_achados
       WHERE codigo LIKE $1`,
      [prefixo + '%']
    );

    const codigo = prefixo + String(sequencia.rows[0].proximo).padStart(4, '0');

    const resultado = await client.query(
      `INSERT INTO itens_achados (
         codigo, titulo, descricao, categoria_id, cor, marca,
         local_encontrado, data_encontrado, registrador_id,
         foto_url, observacoes, criado_por
       )
       VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9, $10, $11, $12
       )
       RETURNING id`,
      [
        codigo,
        dados.titulo,
        dados.descricao,
        categoriaId,
        dados.cor,
        dados.marca,
        dados.local_encontrado,
        body.data_encontrado,
        body.registrador_id,
        dados.foto_url,
        dados.observacoes,
        req.user.id,
      ]
    );

    const item = await client.query(`${consultaItem} WHERE i.id = $1`, [resultado.rows[0].id]);

    await client.query('COMMIT');
    return res.status(201).json(item.rows[0]);
  } catch (erro) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (erroRollback) {
        console.error('Falha no rollback:', erroRollback.message);
      }
    }

    if (erro.code === '23503') {
      return responderErro(
        res,
        422,
        'VALIDATION_ERROR',
        'O registrador ou a categoria informados não existem.'
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
      'Não envie código, status ou campos gerados pelo sistema.'
    );
  }

  const limites = {
    titulo: 160,
    descricao: 10000,
    cor: 40,
    marca: 60,
    local_encontrado: 160,
    foto_url: 255,
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

  if (!dataValida(corpo.data_encontrado)) {
    erros.push({
      campo: 'data_encontrado',
      message: 'Informe uma data válida no formato YYYY-MM-DD.',
    });
  }

  if (!idValido(corpo.registrador_id)) {
    erros.push({
      campo: 'registrador_id',
      message: 'Informe um ID de registrador válido.',
    });
  }

  const categoriaId = corpo.categoria_id ?? null;

  if (categoriaId !== null && !idValido(categoriaId)) {
    erros.push({
      campo: 'categoria_id',
      message: 'Informe um ID de categoria válido.',
    });
  }

  if (dados.foto_url) {
    try {
      const url = new URL(dados.foto_url);

      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Protocolo inválido');
      }
    } catch {
      erros.push({
        campo: 'foto_url',
        message: 'Informe uma URL HTTP ou HTTPS válida.',
      });
    }
  }

  if (erros.length) {
    return responderErro(res, 422, 'VALIDATION_ERROR', 'Confira os dados do item.', erros);
  }

  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const atualizado = await client.query(
      `UPDATE itens_achados
       SET titulo = $1,
           descricao = $2,
           categoria_id = $3,
           cor = $4,
           marca = $5,
           local_encontrado = $6,
           data_encontrado = $7,
           registrador_id = $8,
           foto_url = $9,
           observacoes = $10
       WHERE id = $11
       RETURNING id`,
      [
        dados.titulo,
        dados.descricao,
        categoriaId,
        dados.cor,
        dados.marca,
        dados.local_encontrado,
        corpo.data_encontrado,
        corpo.registrador_id,
        dados.foto_url,
        dados.observacoes,
        req.params.id,
      ]
    );

    if (!atualizado.rows.length) {
      await client.query('ROLLBACK');

      return responderErro(res, 404, 'NOT_FOUND', 'Item não encontrado.');
    }

    const resultado = await client.query(`${consultaItem} WHERE i.id = $1`, [req.params.id]);

    await client.query('COMMIT');
    return res.json(resultado.rows[0]);
  } catch (erro) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (erroRollback) {
        console.error('Falha ao desfazer edição:', erroRollback);
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

router.patch('/:id/status', async (req, res, next) => {
  if (!idValido(req.params.id)) {
    return responderErro(res, 422, 'VALIDATION_ERROR', 'ID inválido.');
  }

  const corpo = req.body;
  const statusPermitidos = [
    'RECEBIDO',
    'EM_CUSTODIA',
    'EM_ANALISE',
    'EM_DEVOLUCAO',
    'DEVOLVIDO',
    'DESCARTADO',
  ];

  if (
    !corpo ||
    typeof corpo !== 'object' ||
    Array.isArray(corpo) ||
    Object.keys(corpo).some((campo) => campo !== 'status') ||
    !statusPermitidos.includes(corpo.status)
  ) {
    return responderErro(
      res,
      422,
      'VALIDATION_ERROR',
      'Envie somente o campo status com um valor válido.'
    );
  }

  const transicoes = {
    RECEBIDO: ['EM_CUSTODIA'],
    EM_CUSTODIA: ['EM_ANALISE'],
    EM_ANALISE: ['EM_CUSTODIA'],
    EM_DEVOLUCAO: [],
    DEVOLVIDO: [],
    DESCARTADO: [],
  };

  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const consulta = await client.query(
      'SELECT status FROM itens_achados WHERE id = $1 FOR UPDATE',
      [req.params.id]
    );

    if (!consulta.rows.length) {
      await client.query('ROLLBACK');
      return responderErro(res, 404, 'NOT_FOUND', 'Item não encontrado.');
    }

    const statusAtual = consulta.rows[0].status;

    if (corpo.status !== statusAtual) {
      if (!transicoes[statusAtual]?.includes(corpo.status)) {
        await client.query('ROLLBACK');

        const mensagem = ['EM_DEVOLUCAO', 'DEVOLVIDO'].includes(corpo.status)
          ? 'Utilize o fluxo de devoluções para alterar esse status.'
          : `Transição de ${statusAtual} para ${corpo.status} não permitida.`;

        return responderErro(res, 409, 'CONFLICT', mensagem);
      }

      await client.query('UPDATE itens_achados SET status = $1 WHERE id = $2', [
        corpo.status,
        req.params.id,
      ]);
    }

    const resultado = await client.query(`${consultaItem} WHERE i.id = $1`, [req.params.id]);

    await client.query('COMMIT');
    return res.json(resultado.rows[0]);
  } catch (erro) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (erroRollback) {
        console.error('Falha ao desfazer alteração de status:', erroRollback);
      }
    }

    return next(erro);
  } finally {
    if (client) client.release();
  }
});

export default router;
