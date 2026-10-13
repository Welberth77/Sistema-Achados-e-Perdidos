import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const q = req.query.q ?? '';
  const vinculo = req.query.vinculo ?? '';

  const vinculos = ['ALUNO', 'DOCENTE', 'TERCEIRIZADO', 'SERVIDOR', 'OUTRO'];

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isSafeInteger((page - 1) * limit) ||
    typeof q !== 'string' ||
    typeof vinculo !== 'string' ||
    (vinculo && !vinculos.includes(vinculo))
  ) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Confira os filtros. page deve ser positivo e limit entre 1 e 100.',
        details: [],
      },
    });
  }

  const filtro = `
    WHERE (
      $1 = '' OR
      nome ILIKE '%' || $1 || '%' OR
      matricula ILIKE '%' || $1 || '%' OR
      documento ILIKE '%' || $1 || '%'
    )
    AND ($2 = '' OR vinculo = $2)
  `;

  const parametros = [q.trim(), vinculo];

  try {
    const contagem = await pool.query(
      `SELECT COUNT(*) AS total FROM registradores ${filtro}`,
      parametros
    );

    const resultado = await pool.query(
      `SELECT id, nome, vinculo, matricula, tipo_documento,
              documento, telefone, email, observacoes,
              criado_em, atualizado_em
       FROM registradores
       ${filtro}
       ORDER BY criado_em DESC, id DESC
       LIMIT $3 OFFSET $4`,
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

router.post('/', async (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Envie um objeto JSON com os dados do registrador.',
        details: [],
      },
    });
  }

  const limites = {
    nome: 120,
    vinculo: 20,
    matricula: 40,
    tipo_documento: 20,
    documento: 40,
    telefone: 30,
    email: 160,
    observacoes: 5000,
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

  if (!dados.nome) {
    erros.push({ campo: 'nome', message: 'Informe o nome.' });
  }

  const vinculos = ['ALUNO', 'DOCENTE', 'TERCEIRIZADO', 'SERVIDOR', 'OUTRO'];

  if (!vinculos.includes(dados.vinculo)) {
    erros.push({ campo: 'vinculo', message: 'Informe um vínculo válido.' });
  }

  if (dados.tipo_documento && !['CPF', 'RG', 'OUTRO'].includes(dados.tipo_documento)) {
    erros.push({
      campo: 'tipo_documento',
      message: 'Use CPF, RG ou OUTRO.',
    });
  }

  if (Boolean(dados.tipo_documento) !== Boolean(dados.documento)) {
    erros.push({
      campo: 'documento',
      message: 'Preencha tipo_documento e documento juntos.',
    });
  }

  if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    erros.push({ campo: 'email', message: 'Informe um email válido.' });
  }

  if (erros.length) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Confira os campos do registrador.',
        details: erros,
      },
    });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO registradores (
         nome, vinculo, matricula, tipo_documento,
         documento, telefone, email, observacoes
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, nome, vinculo, matricula, tipo_documento,
                 documento, telefone, email, observacoes,
                 criado_em, atualizado_em`,
      [
        dados.nome,
        dados.vinculo,
        dados.matricula,
        dados.tipo_documento,
        dados.documento,
        dados.telefone,
        dados.email,
        dados.observacoes,
      ]
    );

    return res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'Já existe um registrador com esse tipo e número de documento.',
          details: [],
        },
      });
    }

    return next(erro);
  }
});

router.get('/:id', async (req, res, next) => {
  const id = req.params.id;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Informe um ID inteiro positivo válido.',
        details: [],
      },
    });
  }

  try {
    const resultado = await pool.query(
      `SELECT id, nome, vinculo, matricula, tipo_documento,
              documento, telefone, email, observacoes,
              criado_em, atualizado_em
       FROM registradores
       WHERE id = $1`,
      [id]
    );

    if (!resultado.rows.length) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Registrador não encontrado.',
          details: [],
        },
      });
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    return next(erro);
  }
});

router.put('/:id', async (req, res, next) => {
  const id = req.params.id;
  const body = req.body;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Informe um ID inteiro positivo válido.',
        details: [],
      },
    });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Envie um objeto JSON.',
        details: [],
      },
    });
  }

  const limites = {
    nome: 120,
    vinculo: 20,
    matricula: 40,
    tipo_documento: 20,
    documento: 40,
    telefone: 30,
    email: 160,
    observacoes: 5000,
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

  if (!dados.nome) {
    erros.push({ campo: 'nome', message: 'Informe o nome.' });
  }

  if (!['ALUNO', 'DOCENTE', 'TERCEIRIZADO', 'SERVIDOR', 'OUTRO'].includes(dados.vinculo)) {
    erros.push({ campo: 'vinculo', message: 'Informe um vínculo válido.' });
  }

  if (dados.tipo_documento && !['CPF', 'RG', 'OUTRO'].includes(dados.tipo_documento)) {
    erros.push({
      campo: 'tipo_documento',
      message: 'Use CPF, RG ou OUTRO.',
    });
  }

  if (Boolean(dados.tipo_documento) !== Boolean(dados.documento)) {
    erros.push({
      campo: 'documento',
      message: 'Preencha tipo_documento e documento juntos.',
    });
  }

  if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    erros.push({ campo: 'email', message: 'Informe um email válido.' });
  }

  if (erros.length) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Confira os campos do registrador.',
        details: erros,
      },
    });
  }

  try {
    const resultado = await pool.query(
      `UPDATE registradores
       SET nome = $1,
           vinculo = $2,
           matricula = $3,
           tipo_documento = $4,
           documento = $5,
           telefone = $6,
           email = $7,
           observacoes = $8
       WHERE id = $9
       RETURNING id, nome, vinculo, matricula, tipo_documento,
                 documento, telefone, email, observacoes,
                 criado_em, atualizado_em`,
      [
        dados.nome,
        dados.vinculo,
        dados.matricula,
        dados.tipo_documento,
        dados.documento,
        dados.telefone,
        dados.email,
        dados.observacoes,
        id,
      ]
    );

    if (!resultado.rows.length) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Registrador não encontrado.',
          details: [],
        },
      });
    }

    return res.json(resultado.rows[0]);
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'Já existe um registrador com esse tipo e número de documento.',
          details: [],
        },
      });
    }

    return next(erro);
  }
});

export default router;
