import express from 'express';
import { resumo } from '../controllers/dashboardController.js';
import { autenticarToken, exigePapel } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard/resumo — números do painel (apenas equipe)
router.get('/resumo', autenticarToken, exigePapel('ADMINISTRADOR', 'SERVIDOR'), resumo);

export default router;
