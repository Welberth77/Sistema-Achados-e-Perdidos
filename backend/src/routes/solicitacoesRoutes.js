import express from 'express';
import { listarSolicitacoes, aprovarSolicitacao, rejeitarSolicitacao } from '../controllers/solicitacoesController.js';
import { autenticarToken, exigePapel } from '../middlewares/authMiddleware.js';

const router = express.Router();
const admin = exigePapel('ADMINISTRADOR');

router.get('/', autenticarToken, admin, listarSolicitacoes);
router.post('/:id/aprovar', autenticarToken, admin, aprovarSolicitacao);
router.post('/:id/rejeitar', autenticarToken, admin, rejeitarSolicitacao);

export default router;
