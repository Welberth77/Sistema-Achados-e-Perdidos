import express from 'express';
import { listarCasos, obterCaso, criarCaso, encerrarCaso } from '../controllers/casosController.js';
import { autenticarToken, exigePapel } from '../middlewares/authMiddleware.js';

const router = express.Router();
const staff = exigePapel('ADMINISTRADOR', 'SERVIDOR');

// Todas as rotas de casos são da equipe (administrador/servidor) e exigem login.
// Sem o autenticarToken, req.usuario ficava indefinido e o caso era aberto sem responsável.

// GET /api/casos           - Lista de casos (filtro opcional ?status=)
router.get('/', autenticarToken, staff, listarCasos);

// POST /api/casos          - Abrir um caso (liga item achado + relato)
router.post('/', autenticarToken, staff, criarCaso);

// GET /api/casos/:id        - Visão consolidada do caso
router.get('/:id', autenticarToken, staff, obterCaso);

// PATCH /api/casos/:id/encerrar - Encerrar um caso
router.patch('/:id/encerrar', autenticarToken, staff, encerrarCaso);

export default router;
