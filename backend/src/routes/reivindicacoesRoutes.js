import express from 'express';
import {
  criarReivindicacao, minhasReivindicacoes, listarReivindicacoes,
  aprovarReivindicacao, rejeitarReivindicacao,
} from '../controllers/reivindicacoesController.js';
import { autenticarToken, exigePapel } from '../middlewares/authMiddleware.js';

const router = express.Router();
const staff = exigePapel('ADMINISTRADOR', 'SERVIDOR');

router.post('/', autenticarToken, criarReivindicacao);            // aluno
router.get('/minhas', autenticarToken, minhasReivindicacoes);     // aluno
router.get('/', autenticarToken, staff, listarReivindicacoes);    // staff
router.post('/:id/aprovar', autenticarToken, staff, aprovarReivindicacao);
router.post('/:id/rejeitar', autenticarToken, staff, rejeitarReivindicacao);

export default router;
