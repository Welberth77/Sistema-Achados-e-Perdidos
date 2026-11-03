import express from 'express';
import {
  listarCategorias, criarCategoria, atualizarCategoria, excluirCategoria,
} from '../controllers/categoriasController.js';
import { autenticarToken, exigePapel } from '../middlewares/authMiddleware.js';

const router = express.Router();
const staff = exigePapel('ADMINISTRADOR', 'SERVIDOR');

router.get('/', autenticarToken, listarCategorias);
router.post('/', autenticarToken, staff, criarCategoria);
router.put('/:id', autenticarToken, staff, atualizarCategoria);
router.delete('/:id', autenticarToken, staff, excluirCategoria);

export default router;
