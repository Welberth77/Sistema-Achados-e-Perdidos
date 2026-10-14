import express from 'express';
import { obterCasoConsolidado, encerrarCaso } from '../controllers/casosController.js';

const router = express.Router();

// GET /api/casos/:id - Obter visão consolidada do caso (item, custódia e devolução)
router.get('/:id', obterCasoConsolidado);

// PATCH /api/casos/:id/encerrar - Encerrar um caso
router.patch('/:id/encerrar', encerrarCaso);

export default router;