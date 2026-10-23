import express from 'express';
import { listarCasos, obterCaso, criarCaso, encerrarCaso } from '../controllers/casosController.js';

const router = express.Router();

// GET /api/casos           - Lista de casos (filtro opcional ?status=)
router.get('/', listarCasos);

// POST /api/casos          - Abrir um caso (liga item achado + relato)
router.post('/', criarCaso);

// GET /api/casos/:id        - Visão consolidada do caso
router.get('/:id', obterCaso);

// PATCH /api/casos/:id/encerrar - Encerrar um caso
router.patch('/:id/encerrar', encerrarCaso);

export default router;
