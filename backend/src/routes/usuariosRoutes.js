import express from 'express';
import { listarUsuarios } from '../controllers/usuariosController.js';
import { autenticarToken, exigePapel } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/usuarios — lista de usuários (apenas ADMINISTRADOR)
router.get('/', autenticarToken, exigePapel('ADMINISTRADOR'), listarUsuarios);

export default router;
