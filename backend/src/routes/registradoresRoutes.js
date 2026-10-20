import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/registradores - Lista todos os registradores ou operadores do sistema
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nome, email, role, created_at 
      FROM usuarios 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar registradores:', error);
    res.status(500).json({ error: 'Erro interno no servidor ao buscar registradores.' });
  }
});

export default router;