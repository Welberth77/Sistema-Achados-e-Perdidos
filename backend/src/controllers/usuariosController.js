import pool from '../config/db.js';

// Lista os usuários cadastrados, com o papel (administrador / servidor / comum).
export async function listarUsuarios(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, nome, email, papel, ativo, criado_em
       FROM usuarios
       ORDER BY criado_em DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    return res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
}
