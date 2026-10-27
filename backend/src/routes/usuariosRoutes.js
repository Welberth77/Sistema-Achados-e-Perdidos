import express from 'express';
import { listarUsuarios, alterarPapel, excluirUsuario } from '../controllers/usuariosController.js';
import { autenticarToken, exigePapel } from '../middlewares/authMiddleware.js';

const router = express.Router();
const admin = exigePapel('ADMINISTRADOR');

// GET /api/usuarios — lista de usuários (apenas ADMINISTRADOR)
router.get('/', autenticarToken, admin, listarUsuarios);

// PATCH /api/usuarios/:id/papel — altera o perfil de um usuário
router.patch('/:id/papel', autenticarToken, admin, alterarPapel);

// DELETE /api/usuarios/:id — exclui um usuário
router.delete('/:id', autenticarToken, admin, excluirUsuario);

export default router;
