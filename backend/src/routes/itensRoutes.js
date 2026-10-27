import express from 'express';
import { listarItens, obterItem, criarItem } from '../controllers/itensController.js';
import { autenticarToken, exigePapel } from '../middlewares/authMiddleware.js';

const router = express.Router();
const staff = exigePapel('ADMINISTRADOR', 'SERVIDOR');

// Qualquer usuário autenticado (inclusive aluno) pode listar os itens achados.
router.get('/', autenticarToken, listarItens);
// Detalhe (com custódia) e cadastro são do quadro (admin/servidor).
router.get('/:id', autenticarToken, staff, obterItem);
router.post('/', autenticarToken, staff, criarItem);

export default router;
