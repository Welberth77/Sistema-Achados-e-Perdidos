import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const q = req.query.q ?? '';

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isSafeInteger((page - 1) * limit) ||
    typeof q !== 'string'
  ) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Confira a busca e a paginação.',
        details: [],
      },
    });
  }

  try {
    const filtro = `
      WHERE ($1::text = '' OR nome ILIKE '%' || $1 || '%')
    `;

    const contagem = await pool.query(`SELECT COUNT(*) AS total FROM categorias ${filtro}`, [
      q.trim(),
    ]);

    const resultado = await pool.query(
      `SELECT id, nome, descricao, criado_em, atualizado_em
       FROM categorias
       ${filtro}
       ORDER BY criado_em DESC, id DESC
       LIMIT $2 OFFSET $3`,
      [q.trim(), limit, (page - 1) * limit]
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
