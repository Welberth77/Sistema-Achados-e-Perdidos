import express from 'express';
import { listarItens } from '../controllers/itensController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Qualquer usuário autenticado (inclusive aluno) pode consultar os itens achados.
router.get('/', autenticarToken, listarItens);

export default router;
