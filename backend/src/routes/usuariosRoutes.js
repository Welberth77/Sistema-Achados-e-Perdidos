import express from 'express';
import { listarUsuarios, listarAlunos, alterarPapel, excluirUsuario } from '../controllers/usuariosController.js';
import { autenticarToken, exigePapel } from '../middlewares/authMiddleware.js';

const router = express.Router();
const admin = exigePapel('ADMINISTRADOR');
const staff = exigePapel('ADMINISTRADOR', 'SERVIDOR');

// GET /api/usuarios — lista completa (apenas ADMINISTRADOR)
router.get('/', autenticarToken, admin, listarUsuarios);
// GET /api/usuarios/alunos — usuários comuns, para a devolução (staff)
router.get('/alunos', autenticarToken, staff, listarAlunos);
// PATCH /api/usuarios/:id/papel — altera o perfil
router.patch('/:id/papel', autenticarToken, admin, alterarPapel);
// DELETE /api/usuarios/:id — exclui um usuário
router.delete('/:id', autenticarToken, admin, excluirUsuario);

export default router;
