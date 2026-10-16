import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/relatos/consulta - Consulta relatos/ocorrências com suporte a filtros opcionais
router.get('/consulta', async (req, res) => {
  try {
    const { status, categoria, data_inicio, data_fim } = req.query;
    let query = 'SELECT * FROM relatos WHERE 1=1';
    let values = [];
    let index = 1;

    if (status) {
      query += ` AND status = $${index++}`;
      values.push(status);
    }
    if (categoria) {
      query += ` AND categoria = $${index++}`;
      values.push(categoria);
    }
    if (data_inicio) {
      query += ` AND created_at >= $${index++}`;
      values.push(data_inicio);
    }
    if (data_fim) {
      query += ` AND created_at <= $${index++}`;
      values.push(data_fim);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao consultar relatos:', error);
    res.status(500).json({ error: 'Erro interno ao consultar relatos.' });
  }
});

export default router;