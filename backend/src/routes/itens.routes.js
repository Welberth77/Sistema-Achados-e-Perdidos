import express from 'express';
// Importa o pool de conexão com o PostgreSQL utilizando db.js e a extensão .js
import pool from '../config/db.js'; 

const router = express.Router();

// GET /api/itens - Lista todos os itens achados
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM itens ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    res.status(500).json({ error: 'Erro interno no servidor ao buscar itens.' });
  }
});

// POST /api/itens - Regista um novo item achado
router.post('/', async (req, res) => {
  const { titulo, descricao, categoria, local_encontro, data_encontro } = req.body;
  
  try {
    const query = `
      INSERT INTO itens (titulo, descricao, categoria, local_encontro, data_encontro, status) 
      VALUES ($1, $2, $3, $4, $5, 'pendente') 
      RETURNING *;
    `;
    const values = [titulo, descricao, categoria, local_encontro, data_encontro];
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar item:', error);
    res.status(500).json({ error: 'Erro interno ao registar o item.' });
  }
});

export default router;
