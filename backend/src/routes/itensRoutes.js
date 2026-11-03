import express from 'express';
import { listarItens, obterItem, criarItem, atualizarItem, excluirItem } from '../controllers/itensController.js';
import { autenticarToken, exigePapel } from '../middlewares/authMiddleware.js';

const router = express.Router();
const staff = exigePapel('ADMINISTRADOR', 'SERVIDOR');

// Qualquer usuário autenticado (inclusive aluno) pode listar os itens achados.
router.get('/', autenticarToken, listarItens);
// Detalhe (com custódia), cadastro, edição e exclusão são do quadro (admin/servidor).
router.get('/:id', autenticarToken, staff, obterItem);
router.post('/', autenticarToken, staff, criarItem);
router.put('/:id', autenticarToken, staff, atualizarItem);
router.delete('/:id', autenticarToken, staff, excluirItem);

export default router;
