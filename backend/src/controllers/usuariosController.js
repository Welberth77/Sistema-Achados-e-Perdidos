import pool from '../config/db.js';

const PAPEIS = ['ADMINISTRADOR', 'SERVIDOR', 'USUARIO'];

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

// PATCH /api/usuarios/:id/papel — altera o perfil de um usuário (apenas ADMINISTRADOR).
export async function alterarPapel(req, res) {
  const { id } = req.params;
  const { papel } = req.body;

  if (!PAPEIS.includes(papel)) {
    return res.status(422).json({ error: 'Perfil inválido.' });
  }
  if (req.usuario && String(req.usuario.id) === String(id)) {
    return res.status(400).json({ error: 'Você não pode alterar o seu próprio perfil.' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE usuarios SET papel = $1, atualizado_em = now()
       WHERE id = $2
       RETURNING id, nome, email, papel, ativo, criado_em`,
      [papel, id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao alterar perfil:', err);
    return res.status(500).json({ error: 'Erro ao alterar o perfil do usuário.' });
  }
}

// DELETE /api/usuarios/:id — exclui um usuário (apenas ADMINISTRADOR).
export async function excluirUsuario(req, res) {
  const { id } = req.params;

  if (req.usuario && String(req.usuario.id) === String(id)) {
    return res.status(400).json({ error: 'Você não pode excluir a sua própria conta.' });
  }

  try {
    const { rowCount } = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    if (!rowCount) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    return res.status(204).end();
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    return res.status(500).json({ error: 'Erro ao excluir o usuário.' });
  }
}
