import express from 'express';
import { meusRelatos, criarRelato } from '../controllers/relatosController.js';
import { autenticarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Qualquer usuário autenticado (inclusive aluno) acessa os próprios relatos.
router.get('/meus', autenticarToken, meusRelatos);
router.post('/', autenticarToken, criarRelato);

export default router;
